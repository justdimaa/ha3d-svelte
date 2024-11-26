{ pkgs ? import <nixpkgs> {} }:

let in pkgs.mkShell {
  buildInputs = with pkgs; [
    nodePackages.tailwindcss
    nodejs_20
    bun
  ];
  nativeBuildInputs = with pkgs; [];

  shellHook = ''
    export PATH=$PATH:~/.bun/bin;
    export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
    export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
    export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
    export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
  '';
}
