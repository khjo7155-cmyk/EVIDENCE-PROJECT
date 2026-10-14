import { EvidenceInventory, EvidenceMatlabAdapter } from "@wrtnlabs/evidence";
import { TestValidator } from "@nestia/e2e";
import { dedent } from "@typia/utils";

import { EvidenceTestSourceSnapshot } from "../../internal/EvidenceTestSourceSnapshot";

/**
 * Extracts MATLAB's public class and top-level function denominator.
 *
 * Visibility, accessor forms, aliases, and class metadata determine public
 * units, while private, nested, and local declarations must not be promoted.
 *
 * 1. Analyze class properties, methods, events, enumerations, accessors, and
 *    separate function files.
 * 2. Verify exact public identities, shared accessor sites, ownership, and host
 *    coverage.
 * 3. Resolve an aliased public property through the inventory.
 *
 * @evidence contracts/testing.md#behavioral-verification Analyzes MATLAB class members and function files and asserts identities, accessor sites, ownership, host coverage and alias resolution.
 * @evidence contracts/testing.md#independent-expectations Expected units are the declared public surface written in the test.
 * @evidence contracts/testing.md#distinguishing-cases Covers properties, methods, events, enumerations, accessors, separate function files, and excluded private, nested and local declarations.
 * @evidence contracts/testing.md#execution-ownership The exported test_matlab_units is discovered by DynamicExecutor under test/src/features and calls maintained source in-process; it installs no consumer, packs nothing and spawns no CLI.
 */
export async function test_matlab_units(): Promise<void> {
  const inventory = await new EvidenceMatlabAdapter().analyze(
    EvidenceTestSourceSnapshot.combine([
      EvidenceTestSourceSnapshot.create(
        "src/Contract.m",
        dedent`
      classdef (Hidden) Contract < handle
        % Public even when Hidden metadata is present.
        properties
          documented % Public value help.
          undocumented
        end
        properties (Access=private)
          secret
        end
        properties (Access=protected)
          protectedValue
        end
        properties (GetAccess=public, SetAccess=private)
          readable
        end
        properties (GetAccess=private, SetAccess=public)
          writable
        end
        properties (Access={?Friend, ?pkg.Other})
          friendOnly
        end
        properties (Constant)
          constant = 1
        end
        properties (Dependent)
          derived
        end
        methods
          function obj = Contract()
          end
          function run(obj)
          end
          function value = get.derived(obj)
            value = 1;
          end
          function obj = set.derived(obj, value)
          end
        end
        methods (Static)
          function create()
          end
        end
        methods (Access=private)
          function hidden(obj)
          end
        end
        methods (Abstract)
          perform(obj)
        end
        enumeration
          Ready
        end
        events
          Changed
        end
        events (ListenAccess=private, NotifyAccess=private)
          SecretChanged
        end
      end
      function local()
      end
    `.concat("\n"),
        ["src/Contract.m", "alias/Contract.m"],
      ),
      EvidenceTestSourceSnapshot.create(
        "src/main.m",
        dedent`
      function value = main()
        value = 1;
        function nested()
        end
      end
      function helper()
      end
    `.concat("\n"),
      ),
      EvidenceTestSourceSnapshot.create(
        "src/private/secret.m",
        "function secret()\nend\n",
      ),
    ]),
  );

  TestValidator.equals("complete MATLAB inventory", inventory.diagnostics, []);
  TestValidator.equals(
    "exact source declarations",
    inventory.units
      .map((unit) =>
        unit.symbol === "file"
          ? `file:${unit.name}`
          : `${unit.symbol}:${unit.identity.join(".")}`,
      )
      .sort((left, right) => left.localeCompare(right)),
    [
      "file:alias/Contract.m",
      "file:src/main.m",
      "type:Contract",
      "property:Contract.documented",
      "property:Contract.undocumented",
      "property:Contract.readable",
      "property:Contract.writable",
      "property:Contract.constant",
      "property:Contract.derived",
      "function:Contract.Contract",
      "function:Contract.run",
      "function:Contract.create",
      "function:Contract.perform",
      "property:Contract.Ready",
      "property:Contract.Changed",
      "function:main",
    ].sort((left, right) => left.localeCompare(right)),
  );
  const derived = inventory.units.find((unit) => unit.name === "derived");
  TestValidator.equals(
    "property accessors share one property",
    derived?.sites?.length,
    3,
  );
  TestValidator.equals(
    "no synthetic accessor functions",
    inventory.units.some(
      (unit) => unit.symbol === "function" && unit.name === "derived",
    ),
    false,
  );
  const contract = inventory.units.find(
    (unit) => unit.name === "Contract" && unit.symbol === "type",
  );
  TestValidator.predicate(
    "explicit ownership",
    inventory.units
      .filter((unit) => unit.identity.length === 2)
      .every((unit) => unit.parentId === contract?.id),
  );
  TestValidator.equals(
    "all undocumented sites remain hosts",
    inventory.hosts.length,
    inventory.units
      // The structural file scope is not a declaration.
      .filter((unit) => unit.symbol !== "file")
      .reduce((count, unit) => count + unit.sites.length, 0),
  );
  const graph = new EvidenceInventory([inventory]);
  TestValidator.equals(
    "logical alias",
    graph.resolve(
      {
        file: "/project/alias/Contract.m",
        segments: ["Contract", "undocumented"],
      },
      inventory.units.map((unit) => unit.id),
    ).status,
    "resolved",
  );
}
