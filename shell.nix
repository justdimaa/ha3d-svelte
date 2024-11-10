{ pkgs ? import <nixpkgs> {} }:

let in pkgs.mkShell {
  buildInputs = with pkgs; [
    stdenv.cc.cc.lib

    nodePackages.tailwindcss
    nodejs_20
    bun
  ];
  nativeBuildInputs = with pkgs; [];

  shellHook = ''
    export PATH=$PATH:~/.bun/bin;
  '';
}
