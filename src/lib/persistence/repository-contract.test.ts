// @vitest-environment node

import {
    mkdtemp,
    rm,
  } from "node:fs/promises";
  
  import {
    tmpdir,
  } from "node:os";
  
  import path from "node:path";
  
  import {
    InMemoryCareerRepository,
  } from "./in-memory-repository";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  import {
    runCareerRepositoryContract,
  } from "./repository-contract.test-utils";
  
  runCareerRepositoryContract(
    "InMemoryCareerRepository",
    () => ({
      repository:
        new InMemoryCareerRepository(),
    })
  );
  
  runCareerRepositoryContract(
    "JsonFileCareerRepository",
    async () => {
      const temporaryDirectory =
        await mkdtemp(
          path.join(
            tmpdir(),
            "careerlm-contract-test-"
          )
        );
  
      const dataFilePath =
        path.join(
          temporaryDirectory,
          "data.json"
        );
  
      return {
        repository:
          new JsonFileCareerRepository(
            dataFilePath
          ),
  
        cleanup: async () => {
          await rm(
            temporaryDirectory,
            {
              recursive: true,
              force: true,
            }
          );
        },
      };
    }
  );