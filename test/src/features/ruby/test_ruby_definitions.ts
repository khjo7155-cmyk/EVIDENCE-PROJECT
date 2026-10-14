import { EvidenceRubyAdapter } from "@wrtnlabs/evidence";
import type { IEvidenceInventory, IEvidenceUnit } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Merges compatible Ruby reopenings while retaining replacement conflicts.
 *
 * Reopened declarations can share identity, but incompatible definitions must
 * remain incomplete.
 *
 * 1. Analyze two compatible `Shop::Sale` class bodies and require one semantic
 *    type with two physical sites and no diagnostics.
 * 2. Analyze conflicting container, superclass, constant, attribute, and method
 *    replacements; require incompleteness, every conflict code, and both method
 *    sites.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes compatible Ruby reopenings and conflicting replacements and asserts merged identity, sites, incompleteness and conflict codes.
 * @evidence contracts/testing.md#independent-expectations Expected merging follows Ruby's reopening semantics; every conflict code is listed by hand from the fixture.
 * @evidence contracts/testing.md#distinguishing-cases Covers two compatible class bodies and conflicting container, superclass, constant, attribute and method replacements.
 * @evidence contracts/testing.md#execution-ownership The exported test_ruby_definitions is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_ruby_definitions(): Promise<void> {
  const compatible = await new EvidenceRubyAdapter().analyze(
    EvidenceTestSourceSnapshot.combine([
      EvidenceTestSourceSnapshot.create(
        "lib/shop/sale.rb",
        dedent`
          module Shop
            class Sale < Record
              def total; 1; end
            end
          end
        `,
      ),
      EvidenceTestSourceSnapshot.create(
        "lib/shop/sale_extensions.rb",
        dedent`
          module Shop
            class Sale
              def currency; "USD"; end
            end
          end
        `,
      ),
    ]),
  );

  TestValidator.equals(
    "compatible Ruby reopenings",
    compatible.diagnostics,
    [],
  );
  TestValidator.equals(
    "reopened Ruby class sites",
    requireUnit(compatible, "Shop.Sale").sites.length,
    2,
  );

  const conflicting = await new EvidenceRubyAdapter().analyze(
    EvidenceTestSourceSnapshot.create(
      "lib/conflicts.rb",
      dedent`
        module Conflict
          class Entry < First
            VALUE = 1
            attr_reader :name
            def run; 1; end
          end
        end

        module Conflict
          module Entry
            VALUE = 2
            attr_reader :name
            def run; 2; end
          end
        end

        class Collision
          attr_reader :status
          def status; :ready; end
        end

        class Parent < First; end
        class Parent < Second; end
      `,
    ),
  );
  const codes = new Set(
    conflicting.diagnostics.map((diagnostic) => diagnostic.code),
  );

  // Runtime replacements stay represented by all sites while completeness fails.
  TestValidator.equals(
    "conflicting Ruby inventory",
    conflicting.complete,
    false,
  );
  for (const code of [
    "ruby-address-conflict",
    "ruby-attribute-redefinition",
    "ruby-constant-redefinition",
    "ruby-container-kind",
    "ruby-method-redefinition",
    "ruby-superclass-conflict",
  ])
    TestValidator.predicate(`Ruby conflict ${code}`, codes.has(code));
  TestValidator.equals(
    "redefined Ruby method sites",
    requireUnit(conflicting, "Conflict.Entry.run").sites.length,
    2,
  );
}

function requireUnit(
  inventory: IEvidenceInventory,
  identity: string,
): IEvidenceUnit {
  const unit = inventory.units.find(
    (candidate) => candidate.identity.join(".") === identity,
  );
  if (unit === undefined) throw new Error(`Missing Ruby unit: ${identity}`);
  return unit;
}
