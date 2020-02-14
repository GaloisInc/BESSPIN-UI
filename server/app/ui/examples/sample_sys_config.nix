{

  # Options for replacing certain tool suite components with custom versions,
  # which will be used in place of the originals for downstream build steps.
  # For example, if you set `customize.gnuToolchainSrc` to the path to a
  # customized version of `riscv-gnu-toolchain`, the tool suite will compile
  # GCC from those sources and use it when building Linux kernel images or
  # test binaries.
  customize = {

    # Replace the GFE simulator binaries with custom versions.  For each
    # "name = path" pair, the tool suite will copy the binary from `path` and
    # give it the standard name `gfe-simulator-${name}`.
    #
    # When `simulatorBins` is set, all default GFE simulators will be omitted
    # from the build.  However, it is legal to omit some keys from the map -
    # for example, if you have only Chisel simulators, you can omit the
    # `bluespec_*` keys.  In that case, the `gfe-simulator-bluespec_*`
    # binaries will not be available in the nix shell.
    simulatorBins = {
     chisel_p1 = /path/to/exe_HW_chisel_p1_sim;
     chisel_p2 = /path/to/exe_HW_chisel_p2_sim;
     bluespec_p1 = /path/to/exe_HW_bluespec_p1_sim;
     bluespec_p2 = /path/to/exe_HW_bluespec_p2_sim;
     elf_to_hex = /path/to/elf_to_hex;
    };

    # Obtain processor bitstreams from a custom directory, instead of from
    # `gfe/bitstreams/`.  The bitstreams directory should have the same
    # layout as in the GFE, with a pair of files `soc_${proc}.bit` and
    # `soc_${proc}.ltx` for each processor.  The tool-suite command
    # `gfe-program-fpga ${proc}` will then program the FPGA using the files
    # copied from this custom directory.
    #
    # As with `simulatorBins`, it's legal to omit some files from this
    # directory.  For example, if you only plan to test Bluespec P1
    # processors, your `bitstreams` directory only needs to contain
    # `soc_bluespec_p1.bit` and `soc_bluespec_p1.ltx`.
    bitstreams = /path/to/bitstreams;

    # Replace the sources for riscv-gnu-toolchain with a custom version.  The
    # entire toolchain (all the `riscv64-unknown-elf-*` and
    # `riscv64-unknown-linux-gnu-*` binaries) will be built from the custom
    # sources.
    gnuToolchainSrc = /path/to/riscv-gnu-toolchain;

    # Replace the sources for rocket-chip (or related libraries) with a
    # custom version.
    rocketChipSrc = /path/to/rocket-chip;
    chisel3Src = /path/to/chisel3;
    firrtlSrc = /path/to/firrtl;
    hardfloatSrc = /path/to/hardfloat;

    # Replace the Linux images used by testgen.  Images should be `bbl` ELF
    # binaries, as built by `make` inside the `gfe/bootmem` directory.
    linux-image-debian = /path/to/linux-bbl;
    linux-image-debian-qemu-testgen = /path/to/linux-bbl;
    linux-image-busybox = /path/to/linux-bbl;
    linux-image-busybox-qemu = /path/to/linux-bbl;
  };

  # Whether to build private packages from source.  Note that most TA-1 teams
  # do not have access to the source repositories, and thus will not be able
  # to build these packages.
  buildPrivate = {
    verific = false;
    bsc = false;
  };

  # Whether or not to "disable" packages that depend on private
  # packages. Setting this to true replaces the packages depending on
  # a given private package with a shell script that gives an error
  # message. This is necessary if one wants to use the nix shell
  # without access to the source code or the binary cache.
  disabled = {
    verific = false;
    bsc = false;
  };

  # Whether to fetch large source packages directly, rather than using the
  # cached copies.  Most of these are git repositories, where a clone (with
  # full history) is much larger than the snapshot that would be downloaded
  # from the cache.
  fetchUncached = {
    riscv-linux = false;
    busybox = false;
    gfe = false;
    debian-repo-snapshot = false;
  };

  # Use the precompiled bitstreams instead of actually building the
  # bitstreams using Nix. This is necessary if you don't have a Vivado
  # license.
  precompiledBitstreams = true;

  # Paths that need to be accessed outside of the sandbox for building
  # processor bitstreams. Since these paths appear in the derivations
  # of the bitstreams, we recommend that you leave these unchanged and
  # symlink the necessary files if you want the nix store hashes to be
  # consistent across different machines.
  systemFiles = {
    # License files for your Bluespec and Vivado installations
    bluespecLicense = "/opt/besspin/license/bluespec.lic";
    vivadoLicense = "/opt/besspin/licenses/Xilinx.lic";

    # This should be the installation directory for the particular
    # version of Vivado that you are using. For example, if you are
    # using Vivado 2019.1 and you installed it in /opt/Xilinx, then
    # this might be /opt/Xilinx/Vivado/2019.1
    vivadoPrefix = "/opt/besspin/vivado";
  };

  # Overrides source URLs, branches, and revisions for accessing git
  # repositories.  Keys in this mapping can be either a plain URL, in which
  # case all fetches of that repository will use the override, or
  # `"url#commit-hash"`, to restrict the override to fetches of a particular
  # commit from the repo.  Each value can be a string URL, which means use
  # the current HEAD commit of the repository at that URL, or a complete Nix
  # attrset to be passed to `builtins.fetchGit`.
  #
  # To override fetches that use `fetchFromGitHub`, use the url
  # `https://github.com/<owner>/<repo>.git` (with no trailing slash).
  #
  # Note that if you want to override URLs in bulk (for example, to change
  # SSH URLs to HTTPS equivalents), it's better to set the git `insteadOf`
  # option rather than using `gitSrcs`.  See `man git-config` for details.
  #
  # When fetching the HEAD commit of a repository, Nix will cache the result
  # according to its `tarball-ttl` config setting, which defaults to 1 hour.
  # It will not recheck the repository to see if HEAD changed until that TTL
  # expires.  Invoke Nix with `--option tarball-ttl 0` or change your
  # `nix.conf` settings to override this.
  gitSrcs = {
    # Use the HEAD commit of `~/repo1` instead of fetching the pinned
    # revision from Gitlab.
    #"git@gitlab-ext.galois.com:ssith/repo1.git" = "/home/me/repo1";

    # Use the HEAD commit of `~/repo2`, but only to replace commit
    # `00112233445566778899aabbccddeeff00112233`.  Other references to
    # `repo2` will continue to use the pinned revision.
    #"git@gitlab-ext.galois.com:ssith/repo2.git#00112233445566778899aabbccddeeff00112233" ="/home/me/repo2";

    # Fetch revision `aabbccddeeff0011223300112233445566778899` from
    # `my-branch` Gitlab, instead of using the normal pinned revision.
    #"git@gitlab-ext.galois.com:ssith/repo3.git" = {
    #  url = "git@gitlab-ext.galois.com:ssith/repo3.git";
    #  rev = "aabbccddeeff0011223300112233445566778899";
    #  ref = "my-branch";
    #};

    # Use the HEAD commit of `~/repo4`, but only when building `some-package`.
    # All other packages will use the normal URL.
    #"git@gitlab-ext.galois.com:ssith/repo4.git%some-package" = "/home/me/repo4";
  };

  # If set, each Git fetch will be reported on stderr during the Nix build
  # process.  This can be useful for finding the URLs to use as keys in
  # `gitSrcs`.
  traceFetch = false;
}