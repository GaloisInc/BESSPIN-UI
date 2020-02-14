import React from 'react';

import {
    Container,
} from 'react-bootstrap';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';

import { Header } from '../components/Header';

export interface IReport {
    id: number;
    log: string;
}

/**
 * NOTE: the data (below) is hard-coded sample data to help prototype
 *       the UI screen for viewing a given test-report
 */
const sampleReport: IReport = {
    id: 1,
    log: `
    testgen_BufferErrors.sh: Configuration loaded successfully.
    testgen_BufferErrors.sh: Using feature model </home/gitlab-runner/builds/eEFojcZz/0/ssith/testgen/scripts/../1_BufferErrors/BufferErrors.cfr> to generate tests.
    testgen_BufferErrors.sh: Generating tests <./generateTests.py --model /home/gitlab-runner/builds/eEFojcZz/0/ssith/testgen/scripts/../1_BufferErrors/BufferErrors.cfr --heap-size 8M --stack-size 8K --num 25 --skip 0 --out output>
    INFO:__main__:Loaded model from /home/gitlab-runner/builds/eEFojcZz/0/ssith/testgen/scripts/../1_BufferErrors/BufferErrors.cfr
    INFO:__main__:Sliced model /home/gitlab-runner/builds/eEFojcZz/0/ssith/testgen/scripts/../1_BufferErrors/BufferErrors.cfr with BufferErrors_Test
    INFO:__main__:Enumerating instances...(this can take a while)
    INFO:__main__:Done generating instances
    INFO:__main__:Output directory output does not exist, it will be created
    INFO:__main__:Created output directory output
    INFO:__main__:Generating 25 tests with seed=8925606550330056957, heap-size=8388608, stack-size=8192 into output
    Using seed 8925606550330056957
    [KGenerating test 0
    [KGenerating test 1
    [KGenerating test 2
    [KGenerating test 3
    [KGenerating test 4
    [KGenerating test 5
    [KGenerating test 6
    [KGenerating test 7
    [KGenerating test 8
    [KGenerating test 9
    [KGenerating test 10
    [KGenerating test 11
    [KGenerating test 12
    [KGenerating test 13
    [KGenerating test 14
    [KGenerating test 15
    [KGenerating test 16
    [KGenerating test 17
    [KGenerating test 18
    [KGenerating test 19
    [KGenerating test 20
    [KGenerating test 21
    [KGenerating test 22
    [KGenerating test 23
    [KGenerating test 24
    Done.
    testgen_BufferErrors.sh: Tests generated successfully
    riscv64-unknown-elf-gcc -o 10.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 10.c
    10.c: In function 'test':
    10.c:81:19: warning: variable 'tmp_ujPTCazzQd' set but not used [-Wunused-but-set-variable]
       81 |     unsigned char tmp_ujPTCazzQd;
          |                   ^~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 20.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 20.c
    20.c: In function 'test':
    20.c:187:24: warning: 'tmp_voclfkquHeFUyCJ' may be used uninitialized in this function [-Wmaybe-uninitialized]
      187 |          buf_vzXh[idx] = tmp_voclfkquHeFUyCJ;
          |          ~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 23.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 23.c
    23.c: In function 'test':
    23.c:81:18: warning: variable 'tmp_lVRGtIsFwKI' set but not used [-Wunused-but-set-variable]
       81 |     signed short tmp_lVRGtIsFwKI;
          |                  ^~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 9.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 9.c
    9.c: In function 'test':
    9.c:118:19: warning: unused variable 'buf2_GxIPVxbGJgI' [-Wunused-variable]
      118 |     unsigned long buf2_GxIPVxbGJgI[SIZE(unsigned long,1016,8192)];
          |                   ^~~~~~~~~~~~~~~~
    9.c:81:20: warning: variable 'tmp_mgOTgbOGGWOfOjh' set but not used [-Wunused-but-set-variable]
       81 |     unsigned short tmp_mgOTgbOGGWOfOjh;
          |                    ^~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 16.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 16.c
    16.c: In function 'test':
    16.c:81:11: warning: variable 'tmp_NJUyABFHDIWS' set but not used [-Wunused-but-set-variable]
       81 |     float tmp_NJUyABFHDIWS;
          |           ^~~~~~~~~~~~~~~~
    16.c: In function 'main':
    16.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    riscv64-unknown-elf-gcc -o 12.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 12.c
    12.c: In function 'main':
    12.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    12.c: In function 'test':
    12.c:187:32: warning: 'tmp_uHPyBMcWnVG' may be used uninitialized in this function [-Wmaybe-uninitialized]
      187 |          buf_vVrgoPryaide[idx] = tmp_uHPyBMcWnVG;
          |          ~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 22.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 22.c
    22.c: In function 'test':
    22.c:187:27: warning: 'tmp_QpNboGZLqxD' may be used uninitialized in this function [-Wmaybe-uninitialized]
      187 |          buf_YQOFHfY[idx] = tmp_QpNboGZLqxD;
          |          ~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 8.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 8.c
    8.c: In function 'main':
    8.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    8.c: In function 'test':
    8.c:185:36: warning: 'tmp_hRILtozdswJ' may be used uninitialized in this function [-Wmaybe-uninitialized]
      185 |          *(buf_mpsrjJaGiemK + idx) = tmp_hRILtozdswJ;
          |          ~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 4.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 4.c
    4.c: In function 'main':
    4.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    4.c: In function 'test':
    4.c:148:33: warning: 'tmp_yEyAFmFEJZx' may be used uninitialized in this function [-Wmaybe-uninitialized]
      148 |                 buf_MQrltT[idx] = tmp_yEyAFmFEJZx;
          |                 ~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 7.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 7.c
    7.c: In function 'main':
    7.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    7.c: In function 'test':
    7.c:148:32: warning: 'tmp_OQobxGWyvztz' may be used uninitialized in this function [-Wmaybe-uninitialized]
      148 |                 buf_Fkodb[idx] = tmp_OQobxGWyvztz;
          |                 ~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 11.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 11.c
    11.c: In function 'test':
    11.c:81:19: warning: variable 'tmp_ixfPc' set but not used [-Wunused-but-set-variable]
       81 |     unsigned long tmp_ixfPc;
          |                   ^~~~~~~~~
    11.c: In function 'main':
    11.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    riscv64-unknown-elf-gcc -o 21.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 21.c
    21.c: In function 'test':
    21.c:81:17: warning: variable 'tmp_EsZqRchLZGBgqF' set but not used [-Wunused-but-set-variable]
       81 |     signed long tmp_EsZqRchLZGBgqF;
          |                 ^~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 3.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 3.c
    3.c: In function 'test':
    3.c:187:27: warning: 'tmp_nrOjFH' may be used uninitialized in this function [-Wmaybe-uninitialized]
      187 |          buf_Vyefmup[idx] = tmp_nrOjFH;
          |          ~~~~~~~~~~~~~~~~~^~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 19.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 19.c
    19.c: In function 'main':
    19.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    19.c: In function 'test':
    19.c:185:27: warning: 'tmp_TnUKicPjfcxk' may be used uninitialized in this function [-Wmaybe-uninitialized]
      185 |          *(buf_OiO + idx) = tmp_TnUKicPjfcxk;
          |          ~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 6.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 6.c
    6.c: In function 'test':
    6.c:146:41: warning: 'tmp_oHHewINBOG' may be used uninitialized in this function [-Wmaybe-uninitialized]
      146 |                 *(buf_vyOSpilPgr + idx) = tmp_oHHewINBOG;
          |                 ~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 5.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 5.c
    5.c: In function 'test':
    5.c:81:16: warning: variable 'tmp_NobhldUwkaSR' set but not used [-Wunused-but-set-variable]
       81 |     signed int tmp_NobhldUwkaSR;
          |                ^~~~~~~~~~~~~~~~
    5.c: In function 'main':
    5.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    riscv64-unknown-elf-gcc -o 18.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 18.c
    18.c: In function 'main':
    18.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    18.c: In function 'test':
    18.c:185:39: warning: 'tmp_bukJQAtsyUJzDpg' may be used uninitialized in this function [-Wmaybe-uninitialized]
      185 |          *(buf_LlklwIoGdDwpLVK + idx) = tmp_bukJQAtsyUJzDpg;
          |          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 24.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 24.c
    24.c: In function 'test':
    24.c:185:29: warning: 'tmp_mixQRHzshfTOf' may be used uninitialized in this function [-Wmaybe-uninitialized]
      185 |          *(buf_anlwd + idx) = tmp_mixQRHzshfTOf;
          |          ~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 13.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 13.c
    13.c: In function 'test':
    13.c:118:20: warning: unused variable 'buf2_UHJHgqouWNKTi' [-Wunused-variable]
      118 |     unsigned short buf2_UHJHgqouWNKTi[SIZE(unsigned short,14,8192)];
          |                    ^~~~~~~~~~~~~~~~~~
    13.c:81:18: warning: variable 'tmp_kMlEpmlvJDQVJYy' set but not used [-Wunused-but-set-variable]
       81 |     signed short tmp_kMlEpmlvJDQVJYy;
          |                  ^~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 14.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 14.c
    14.c: In function 'main':
    14.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    14.c: In function 'test':
    14.c:187:35: warning: 'tmp_hvss' may be used uninitialized in this function [-Wmaybe-uninitialized]
      187 |          buf_SHTYYKRdakaZhkW[idx] = tmp_hvss;
          |          ~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~
    riscv64-unknown-elf-gcc -o 17.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 17.c
    17.c: In function 'test':
    17.c:148:31: warning: 'tmp_MNrEDuzsTPrxiPS' may be used uninitialized in this function [-Wmaybe-uninitialized]
      148 |                 buf_BwtP[idx] = tmp_MNrEDuzsTPrxiPS;
          |                 ~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 1.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 1.c
    1.c: In function 'main':
    1.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    1.c: In function 'test':
    1.c:185:37: warning: 'tmp_BivOZXyouAvdd' may be used uninitialized in this function [-Wmaybe-uninitialized]
      185 |          *(buf_JxluXyrQeArga + idx) = tmp_BivOZXyouAvdd;
          |          ~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 0.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 0.c
    0.c: In function 'main':
    0.c:223:5: warning: label 'COMPLETE' defined but not used [-Wunused-label]
      223 |     COMPLETE:
          |     ^~~~~~~~
    0.c: In function 'test':
    0.c:148:35: warning: 'tmp_ZRvubudwUReuC' may be used uninitialized in this function [-Wmaybe-uninitialized]
      148 |                 buf_AAAyraud[idx] = tmp_ZRvubudwUReuC;
          |                 ~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~~~~
    riscv64-unknown-elf-gcc -o 15.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 15.c
    15.c: In function 'test':
    15.c:81:12: warning: variable 'tmp_Xtfa' set but not used [-Wunused-but-set-variable]
       81 |     double tmp_Xtfa;
          |            ^~~~~~~~
    riscv64-unknown-elf-gcc -o 2.riscv -Wall -O0 -march=rv64imafdc -mabi=lp64d 2.c
    2.c: In function 'test':
    2.c:148:42: warning: 'tmp_ssZV' may be used uninitialized in this function [-Wmaybe-uninitialized]
      148 |                 buf_AiYJeJKMUrneXCp[idx] = tmp_ssZV;
          |                 ~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~
    0.c
    0.riscv
    1.c
    1.riscv
    10.c
    10.riscv
    11.c
    11.riscv
    12.c
    12.riscv
    13.c
    13.riscv
    14.c
    14.riscv
    15.c
    15.riscv
    16.c
    16.riscv
    17.c
    17.riscv
    18.c
    18.riscv
    19.c
    19.riscv
    2.c
    2.riscv
    20.c
    20.riscv
    21.c
    21.riscv
    22.c
    22.riscv
    23.c
    23.riscv
    24.c
    24.riscv
    3.c
    3.riscv
    4.c
    4.riscv
    5.c
    5.riscv
    6.c
    6.riscv
    7.c
    7.riscv
    8.c
    8.riscv
    9.c
    9.riscv
    Makefile
    testsParameters.h
    emulateDir.sh: Tests cross compiled successfully
    Info in emulateDir.sh: Copying <debian> image for <fpga> from Nix
    programFpga.sh: Programming the FPGA...
    gfe-program-fpga: programming bitstream <5fdd75859d38c0e16a76fcec4732fb64>.
    
    ****** Vivado Lab Edition v2019.1 (64-bit)
      **** SW Build 2552052 on Fri May 24 14:47:09 MDT 2019
        ** Copyright 1986-2019 Xilinx, Inc. All Rights Reserved.
    
    source ./tcl/prog_bit.tcl -notrace
    INFO: [Labtools 27-2285] Connecting to hw_server url TCP:localhost:3121
    INFO: [Labtools 27-2222] Launching hw_server...
    INFO: [Labtools 27-2221] Launch Output:
    
    ****** Xilinx hw_server v2019.1
      **** Build date : May 24 2019 at 15:06:40
        ** Copyright 1986-2019 Xilinx, Inc. All Rights Reserved.
    
    
    INFO: [Labtoolstcl 44-466] Opening hw_target localhost:3121/xilinx_tcf/Digilent/210308AAFBB5
    ---------------------
    Program Configuration
    ---------------------
    Bitstream : ./bitstreams/soc_chisel_p2.bit
    Probe Info: ./bitstreams/soc_chisel_p2.ltx
    
    Programming...
    INFO: [Labtools 27-3164] End of startup status: HIGH
    program_hw_devices: Time (s): cpu = 00:00:20 ; elapsed = 00:00:20 . Memory (MB): peak = 991.578 ; gain = 0.000 ; free physical = 4792 ; free virtual = 30588
    INFO: [Labtoolstcl 44-464] Closing hw_target localhost:3121/xilinx_tcf/Digilent/210308AAFBB5
    ****** Webtalk v2019.1 (64-bit)
      **** SW Build 2552052 on Fri May 24 14:47:09 MDT 2019
        ** Copyright 1986-2019 Xilinx, Inc. All Rights Reserved.
    
    source /tmp/.Xil_gitlab-runner/vivado_lab-29518-besspin-fpga-5/webtalk/labtool_webtalk.tcl -notrace
    INFO: [Common 17-186] '/tmp/.Xil_gitlab-runner/vivado_lab-29518-besspin-fpga-5/webtalk/usage_statistics_ext_labtool.xml' has been successfully sent to Xilinx on Thu Feb 13 12:25:42 2020. For additional details about this file, please refer to the WebTalk help file at /opt/Xilinx/Vivado_Lab/2019.1/doc/webtalk_introduction.html.
    INFO: [Common 17-206] Exiting Webtalk at Thu Feb 13 12:25:42 2020...
    Done!
    INFO: [Common 17-206] Exiting vivado_lab at Thu Feb 13 12:25:42 2020...
    Checking environment
    Programming flash
    Programming flash OK
    Finished!
    programFpga.sh: FPGA was programmed successfully!
    getEthAdaptorName: Obtaining the FPGA ethernet adaptor name using the mac address...
    getEthAdaptorName: Success! Adaptor name is <enx0050b6e11a08>.
    
    emulateTests.bufferErrors: Booting debian on <fpga>. This might take a while...
    Connecting on 46745
    Performing a soft reset of the GFE...
    Connecting on 35753
    
    
    Located UART device at /dev/ttyUSB2 with serial number 00882272
    Setup pySerial UART. 115200 baud, 8 NONE 2
    Reading symbols from /home/gitlab-runner/builds/eEFojcZz/0/ssith/testgen/scripts/../osImages/debianFpga.elf...
    (No debugging symbols found in /home/gitlab-runner/builds/eEFojcZz/0/ssith/testgen/scripts/../osImages/debianFpga.elf)
    bbl loader
    [    0.000000] OF: fdt: Ignoring memory range 0xc0000000 - 0xc0200000
    [    0.000000] Linux version 4.20.0 (nixbld@) (gcc version 9.2.0 (GCC)) #1 SMP Wed Jan 29 22:47:52 UTC 2020
    [    0.000000] printk: bootconsole [early0] enabled
    [    0.000000] initrd not found or empty - disabling initrd
    [    0.000000] Reserved memory: created DMA memory pool at 0x0000000080000000, size 512 MiB
    [    0.000000] OF: reserved mem: initialized node ethernet@62100000, compatible id shared-dma-pool
    [    0.000000] Reserved memory: created DMA memory pool at 0x00000000a0000000, size 512 MiB
    [    0.000000] OF: reserved mem: initialized node linux,dma, compatible id shared-dma-pool
    [    0.000000] Zone ranges:
    [    0.000000]   DMA32    [mem 0x00000000c0200000-0x00000000ffffffff]
    [    0.000000]   Normal   [mem 0x0000000100000000-0x00000fffffffffff]
    [    0.000000] Movable zone start for each node
    [    0.000000] Early memory node ranges
    [    0.000000]   node   0: [mem 0x00000000c0200000-0x00000000ffffffff]
    [    0.000000] Initmem setup node 0 [mem 0x00000000c0200000-0x00000000ffffffff]
    [    0.000000] On node 0 totalpages: 261632
    [    0.000000]   DMA32 zone: 3577 pages used for memmap
    [    0.000000]   DMA32 zone: 0 pages reserved
    [    0.000000]   DMA32 zone: 261632 pages, LIFO batch:63
    [    0.000000] software IO TLB: mapped [mem 0xfb1fc000-0xff1fc000] (64MB)
    [    0.000000] elf_hwcap is 0x112d
    [    0.000000] percpu: Embedded 14 pages/cpu @(____ptrval____) s28440 r0 d28904 u57344
    [    0.000000] pcpu-alloc: s28440 r0 d28904 u57344 alloc=14*4096
    [    0.000000] pcpu-alloc: [0] 0 
    [    0.000000] Built 1 zonelists, mobility grouping on.  Total pages: 258055
    [    0.000000] Kernel command line: earlyprintk console=ttyS0,115200 loglevel=15
    [    0.000000] Dentry cache hash table entries: 131072 (order: 8, 1048576 bytes)
    [    0.000000] Inode-cache hash table entries: 65536 (order: 7, 524288 bytes)
    [    0.000000] Sorting __ex_table...
    [    0.000000] Memory: 907092K/1046528K available (3142K kernel code, 213K rwdata, 773K rodata, 52655K init, 765K bss, 139436K reserved, 0K cma-reserved)
    [    0.000000] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=1, Nodes=1
    [    0.000000] rcu: Hierarchical RCU implementation.
    [    0.000000] rcu: 	RCU event tracing is enabled.
    [    0.000000] rcu: 	RCU restricting CPUs from NR_CPUS=8 to nr_cpu_ids=1.
    [    0.000000] rcu: RCU calculated value of scheduler-enlistment delay is 10 jiffies.
    [    0.000000] rcu: Adjusting geometry for rcu_fanout_leaf=16, nr_cpu_ids=1
    [    0.000000] NR_IRQS: 0, nr_irqs: 0, preallocated irqs: 0
    [    0.000000] plic: mapped 16 interrupts to 1 (out of 2) handlers.
    [    0.000000] clocksource: riscv_clocksource: mask: 0xffffffffffffffff max_cycles: 0x171024e7e0, max_idle_ns: 440795205315 ns
    [    0.000000] Calibrating delay loop (skipped), value calculated using timer frequency.. 200.00 BogoMIPS (lpj=1000000)
    [    0.010000] pid_max: default: 32768 minimum: 301
    [    0.010000] Mount-cache hash table entries: 2048 (order: 2, 16384 bytes)
    [    0.020000] Mountpoint-cache hash table entries: 2048 (order: 2, 16384 bytes)
    [    0.040000] rcu: Hierarchical SRCU implementation.
    [    0.050000] smp: Bringing up secondary CPUs ...
    [    0.060000] smp: Brought up 1 node, 1 CPU
    [    0.060000] devtmpfs: initialized
    [    0.080000] random: get_random_u32 called from bucket_table_alloc+0x74/0xe4 with crng_init=0
    [    0.130000] DMA: default coherent area is set
    [    0.130000] clocksource: jiffies: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 19112604462750000 ns
    [    0.140000] futex hash table entries: 256 (order: 2, 16384 bytes)
    [    0.150000] NET: Registered protocol family 16
    [    0.240000] SCSI subsystem initialized
    [    0.250000] libata version 3.00 loaded.
    [    0.260000] usbcore: registered new interface driver usbfs
    [    0.260000] usbcore: registered new interface driver hub
    [    0.270000] usbcore: registered new device driver usb
    [    0.270000] pps_core: LinuxPPS API ver. 1 registered
    [    0.280000] pps_core: Software ver. 5.3.6 - Copyright 2005-2007 Rodolfo Giometti <giometti@linux.it>
    [    0.280000] PTP clock support registered
    [    0.290000] clocksource: Switched to clocksource riscv_clocksource
    [    0.310000] NET: Registered protocol family 2
    [    0.320000] tcp_listen_portaddr_hash hash table entries: 512 (order: 1, 8192 bytes)
    [    0.330000] TCP established hash table entries: 8192 (order: 4, 65536 bytes)
    [    0.340000] TCP bind hash table entries: 8192 (order: 5, 131072 bytes)
    [    0.350000] TCP: Hash tables configured (established 8192 bind 8192)
    [    0.360000] UDP hash table entries: 512 (order: 2, 16384 bytes)
    [    0.360000] UDP-Lite hash table entries: 512 (order: 2, 16384 bytes)
    [    0.370000] NET: Registered protocol family 1
    [   64.560000] Initialise system trusted keyrings
    [   64.560000] workingset: timestamp_bits=62 max_order=18 bucket_order=0
    [   64.750000] Key type asymmetric registered
    [   64.760000] Asymmetric key parser 'x509' registered
    [   64.760000] io scheduler noop registered
    [   64.770000] io scheduler cfq registered (default)
    [   64.770000] io scheduler mq-deadline registered
    [   64.780000] io scheduler kyber registered
    [   65.540000] Serial: 8250/16550 driver, 4 ports, IRQ sharing disabled
    [   65.560000] printk: console [ttyS0] disabled
    [   65.560000] 62300000.uart: ttyS0 at MMIO 0x62300000 (irq = 4, base_baud = 6250000) is a 16550A
    [   65.570000] printk: console [ttyS0] enabled
    [   65.570000] printk: console [ttyS0] enabled
    [   65.580000] printk: bootconsole [early0] disabled
    [   65.580000] printk: bootconsole [early0] disabled
    [   65.600000] libphy: Fixed MDIO Bus: probed
    [   65.650000] xilinx_axienet 62100000.ethernet: assigned reserved memory node ethernet@62100000
    [   65.660000] xilinx_axienet 62100000.ethernet: TX_CSUM 2
    [   65.670000] xilinx_axienet 62100000.ethernet: RX_CSUM 2
    [   65.670000] xilinx_axienet 62100000.ethernet: enabling VCU118-specific quirk fixes
    [   65.680000] libphy: Xilinx Axi Ethernet MDIO: probed
    [   65.700000] ehci_hcd: USB 2.0 'Enhanced' Host Controller (EHCI) Driver
    [   65.710000] usbcore: registered new interface driver usb-storage
    [   65.710000] mousedev: PS/2 mouse device common for all mice
    [   65.720000] usbcore: registered new interface driver usbhid
    [   65.730000] usbhid: USB HID core driver
    [   65.740000] NET: Registered protocol family 17
    [   65.750000] Loading compiled-in X.509 certificates
    [   66.770000] Freeing unused kernel memory: 52652K
    [   66.770000] This architecture does not have kernel memory protection.
    [   66.780000] Run /init as init process
    [   67.660000] systemd[1]: System time before build time, advancing clock.
    [   67.790000] systemd[1]: systemd 242 running in system mode. (+PAM +AUDIT +SELINUX +IMA +APPARMOR +SMACK +SYSVINIT +UTMP +LIBCRYPTSETUP +GCRYPT +GNUTLS +ACL +XZ +LZ4 -SECCOMP +BLKID +ELFUTILS +KMOD +IDN2 -IDN +PCRE2 default-hierarchy=hybrid)
    [   67.810000] systemd[1]: Detected architecture riscv64.
    
    Welcome to [1mDebian GNU/Linux bullseye/sid[0m!
    
    [   78.630000] systemd[1]: /lib/systemd/system/dbus.socket:4: ListenStream= references a path below legacy directory /var/run/, updating /var/run/dbus/system_bus_socket → /run/dbus/system_bus_socket; please update the unit file accordingly.
    [   79.280000] random: systemd: uninitialized urandom read (16 bytes read)
    [   79.310000] systemd[1]: Created slice system-serial\x2dgetty.slice.
    [[0;32m  OK  [0m] Created slice [0;1;39msystem-serial\x2dgetty.slice[0m.
    [   79.360000] random: systemd: uninitialized urandom read (16 bytes read)
    [   79.370000] systemd[1]: Created slice system-getty.slice.
    [[0;32m  OK  [0m] Created slice [0;1;39msystem-getty.slice[0m.
    [   79.420000] random: systemd: uninitialized urandom read (16 bytes read)
    [   79.430000] systemd[1]: Listening on udev Kernel Socket.
    [[0;32m  OK  [0m] Listening on [0;1;39mudev Kernel Socket[0m.
    [   79.450000] systemd[1]: Reached target Swap.
    [[0;32m  OK  [0m] Reached target [0;1;39mSwap[0m.
    [   79.500000] systemd[1]: Listening on Journal Socket.
    [[0;32m  OK  [0m] Listening on [0;1;39mJournal Socket[0m.
    [   79.540000] systemd[1]: Condition check resulted in Kernel Configuration File System being skipped.
    [   79.600000] systemd[1]: Starting Apply Kernel Variables...
             Starting [0;1;39mApply Kernel Variables[0m...
    [   79.640000] systemd[1]: Started Dispatch Password Requests to Console Directory Watch.
    [[0;32m  OK  [0m] Started [0;1;39mDispatch Password …ts to Console Directory Watch[0m.
    [   79.700000] systemd[1]: Condition check resulted in Huge Pages File System being skipped.
    [[0;32m  OK  [0m] Listening on [0;1;39mJournal Socket (/dev/log)[0m.
    [[0;32m  OK  [0m] Listening on [0;1;39mudev Control Socket[0m.
             Starting [0;1;39mudev Coldplug all Devices[0m...
    [[0;32m  OK  [0m] Created slice [0;1;39mUser and Session Slice[0m.
    [[0;32m  OK  [0m] Listening on [0;1;39minitctl Compatibility Named Pipe[0m.
    [[0;32m  OK  [0m] Started [0;1;39mForward Password R…uests to Wall Directory Watch[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mPaths[0m.
    [[0;32m  OK  [0m] Listening on [0;1;39mSyslog Socket[0m.
             Starting [0;1;39mRemount Root and Kernel File Systems[0m...
             Starting [0;1;39mJournal Service[0m...
    [[0;32m  OK  [0m] Reached target [0;1;39mSlices[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mLocal Encrypted Volumes[0m.
             Mounting [0;1;39mPOSIX Message Queue File System[0m...
    [[0;32m  OK  [0m] Reached target [0;1;39mTimers[0m.
    PING 10.88.88.2 (10.88.88.2) 56(84) bytes of data.
    64 bytes from 10.88.88.2: icmp_seq=1 ttl=64 time=1.41 ms
    
    --- 10.88.88.2 ping statistics ---
    1 packets transmitted, 1 received, 0% packet loss, time 0ms
    rtt min/avg/max/mdev = 1.408/1.408/1.408/0.000 ms
    [[0;32m  OK  [0m] Mounted [0;1;39mPOSIX Message Queue File System[0m.
    [[0;32m  OK  [0m] Started [0;1;39mApply Kernel Variables[0m.
    [[0;32m  OK  [0m] Started [0;1;39mRemount Root and Kernel File Systems[0m.
    [   83.650000] systemd[1]: Condition check resulted in Rebuild Hardware Database being skipped.
    [   83.810000] systemd[1]: Starting Load/Save Random Seed...
             Starting [0;1;39mLoad/Save Random Seed[0m...
    [   84.050000] systemd[1]: Starting Create System Users...
             Starting [0;1;39mCreate System Users[0m...
    [   85.770000] systemd[1]: Started Journal Service.
    [[0;32m  OK  [0m] Started [0;1;39mJournal Service[0m.
    [[0;32m  OK  [0m] Started [0;1;39mLoad/Save Random Seed[0m.
    [[0;32m  OK  [0m] Started [0;1;39mCreate System Users[0m.
             Starting [0;1;39mCreate Static Device Nodes in /dev[0m...
    [[0;32m  OK  [0m] Started [0;1;39mCreate Static Device Nodes in /dev[0m.
             Starting [0;1;39mudev Kernel Device Manager[0m...
    [[0;32m  OK  [0m] Reached target [0;1;39mLocal File Systems (Pre)[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mLocal File Systems[0m.
             Starting [0;1;39mCreate Volatile Files and Directories[0m...
    [[0;32m  OK  [0m] Started [0;1;39mudev Kernel Device Manager[0m.
    [[0;32m  OK  [0m] Started [0;1;39mCreate Volatile Files and Directories[0m.
    [[0m[0;31m*     [0m] (1 of 2) A start job is running for /dev/ttyS0 (24s / 5min)
    M
    [K[[0;32m  OK  [0m] Started [0;1;39mudev Coldplug all Devices[0m.
    [K[[0;32m  OK  [0m] Found device [0;1;39m/dev/ttyS0[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mSystem Initialization[0m.
    [[0;32m  OK  [0m] Listening on [0;1;39mD-Bus System Message Bus Socket[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mSockets[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mBasic System[0m.
             Starting [0;1;39mLogin Service[0m...
             Starting [0;1;39mOpenBSD Secure Shell server[0m...
    [[0;32m  OK  [0m] Started [0;1;39mD-Bus System Message Bus[0m.
             Starting [0;1;39mPermit User Sessions[0m...
             Starting [0;1;39mSystem Logging Service[0m...
    [[0;32m  OK  [0m] Started [0;1;39mSystem Logging Service[0m.
    [[0;32m  OK  [0m] Started [0;1;39mPermit User [  196.650000] random: fast init done
    Sessions[0m.
    [[0;32m  OK  [0m] Started [0;1;39mSerial Getty on ttyS0[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mLogin Prompts[0m.
    [[0;32m  OK  [0m] Started [0;1;39mLogin Service[0m.
    
    
    Debian GNU/Linux bullseye/sid ucbvax ttyS0
    
    ucbvax login: 
    emulateTests.bufferErrors: Logging in, activating ethernet, and setting system time...
    root
    
    Password: 
    Linux ucbvax 4.20.0 #1 SMP Wed Jan 29 22:47:52 UTC 2020 riscv64
    
    The programs included with the Debian GNU/Linux system are free software;
    the exact distribution terms for each program are described in the
    individual files in /usr/share/doc/*/copyright.
    
    Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
    permitted by applicable law.
    root@ucbvax:~# echo "auto eth0" > /etc/network/interfaces
    root@ucbvax:~# echo "iface eth0 inet static" >> /etc/network/interfaces
    root@ucbvax:~# echo "address 10.88.88.2/24" >> /etc/network/interfaces
    root@ucbvax:~# ifup eth0
    [  238.550000] net eth0: Promiscuous mode disabled.
    [  238.600000] net eth0: Promiscuous mode disabled.
    root@ucbvax:~# [  239.680000] xilinx_axienet 62100000.ethernet eth0: Link is Down
    [  240.720000] xilinx_axienet 62100000.ethernet eth0: Link is Up - 100Mbps/Full - flow control rx/tx
    
    emulateTests.bufferErrors: IP address is set to be 10.88.88.2. Pinging successfull!
    date -s '@1581626664'
    Thu Feb 13 20:44:24 UTC 2020
    root@ucbvax:~# 
    emulateTests.bufferErrors: debian booted successfully!
    
    emulateTests.bufferErrors: Sending tests...
    nc -lp 1234 > filesToSend.tar.gz
    root@ucbvax:~# ls ./filesToSend.tar.gz
    ./filesToSend.tar.gz
    root@ucbvax:~# sha256sum filesToSend.tar.gz
    96cdbc36a5f7ec347ee32823ceb97c9fd4bb2d7553ae478f9f9b2bd5f12e8a6e  filesToSend.tar.gz
    root@ucbvax:~# tar xvf filesToSend.tar.gz --warning=no-timestamp
    0.c
    0.riscv
    1.c
    1.riscv
    10.c
    10.riscv
    11.c
    11.riscv
    12.c
    12.riscv
    13.c
    13.riscv
    14.c
    14.riscv
    15.c
    15.riscv
    16.c
    16.riscv
    17.c
    17.riscv
    18.c
    18.riscv
    19.c
    19.riscv
    2.c
    2.riscv
    20.c
    20.riscv
    21.c
    21.riscv
    22.c
    22.riscv
    23.c
    23.riscv
    24.c
    24.riscv
    3.c
    3.riscv
    4.c
    4.riscv
    5.c
    5.riscv
    6.c
    6.riscv
    7.c
    7.riscv
    8.c
    8.riscv
    9.c
    9.riscv
    Makefile
    testsParameters.h
    root@ucbvax:~# 
    emulateTests.bufferErrors: Sending successful!
    ls
    0.c	  12.c	    16.c      2.c	23.c	  5.c	   9.c
    0.riscv   12.riscv  16.riscv  2.riscv	23.riscv  5.riscv  9.riscv
    1.c	  13.c	    17.c      20.c	24.c	  6.c	   Makefile
    1.riscv   13.riscv  17.riscv  20.riscv	24.riscv  6.riscv  filesToSend.tar.gz
    10.c	  14.c	    18.c      21.c	3.c	  7.c	   testsParameters.h
    10.riscv  14.riscv  18.riscv  21.riscv	3.riscv   7.riscv
    11.c	  15.c	    19.c      22.c	4.c	  8.c
    11.riscv  15.riscv  19.riscv  22.riscv	4.riscv   8.riscv
    root@ucbvax:~# chmod +x *.riscv
    root@ucbvax:~# ls ./0.riscv
    ./0.riscv
    root@ucbvax:~# ls ./1.riscv
    ./1.riscv
    root@ucbvax:~# ls ./10.riscv
    ./10.riscv
    root@ucbvax:~# ls ./11.riscv
    ./11.riscv
    root@ucbvax:~# ls ./12.riscv
    ./12.riscv
    root@ucbvax:~# ls ./13.riscv
    ./13.riscv
    root@ucbvax:~# ls ./14.riscv
    ./14.riscv
    root@ucbvax:~# ls ./15.riscv
    ./15.riscv
    root@ucbvax:~# ls ./16.riscv
    ./16.riscv
    root@ucbvax:~# ls ./17.riscv
    ./17.riscv
    root@ucbvax:~# ls ./18.riscv
    ./18.riscv
    root@ucbvax:~# ls ./19.riscv
    ./19.riscv
    root@ucbvax:~# ls ./2.riscv
    ./2.riscv
    root@ucbvax:~# ls ./20.riscv
    ./20.riscv
    root@ucbvax:~# ls ./21.riscv
    ./21.riscv
    root@ucbvax:~# ls ./22.riscv
    ./22.riscv
    root@ucbvax:~# ls ./23.riscv
    ./23.riscv
    root@ucbvax:~# ls ./24.riscv
    ./24.riscv
    root@ucbvax:~# ls ./3.riscv
    ./3.riscv
    root@ucbvax:~# ls ./4.riscv
    ./4.riscv
    root@ucbvax:~# ls ./5.riscv
    ./5.riscv
    root@ucbvax:~# ls ./6.riscv
    ./6.riscv
    root@ucbvax:~# ls ./7.riscv
    ./7.riscv
    root@ucbvax:~# ls ./8.riscv
    ./8.riscv
    root@ucbvax:~# ls ./9.riscv
    ./9.riscv
    root@ucbvax:~# 
    emulateTests.bufferErrors: Executing tests...
    ./0.riscv
    <BufferErrors Start>
    
    continous
    
    <beg[  341.340000] 0.riscv[146]: unhandled signal 11 code 0x1 at 0x0000003fffa3e014 in 0.riscv[10000+3000]
    in continuous re[  341.350000] CPU: 0 PID: 146 Comm: 0.riscv Not tainted 4.20.0 #1
    ad/write>
    
    <end[  341.350000] sepc: 000000000001028c ra : 000000000001023c sp : 0000003fffa3ac60
     continuous read[  341.360000]  gp : 0000000000014270 tp : 0000002000159720 t0 : 0000000000011292
    /write>
    
    loop
    
    [  341.370000]  t1 : 000000000000000f t2 : 0000002aaab85e70 s0 : 0000003fffa3cc80
    
    <begin overflow[  341.380000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 0000000000014038
     read/write loop[  341.390000]  a2 : 0000000000000001 a3 : 0000003fffa3ac70 a4 : 00000000000079c0
    >
    
    [  341.400000]  a5 : 0000003fffa3e024 a6 : 000000000000001f a7 : 0000000000000040
    [  341.410000]  s2 : 0000002aaabd79c0 s3 : 0000002000017900 s4 : ffffffffffffffff
    [  341.410000]  s5 : 0000002aaabd7ac0 s6 : 0000002aaabaefa0 s7 : 0000002aaabd79e0
    [  341.420000]  s8 : 0000002aaabd75b0 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  341.430000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  341.440000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  341.440000] sstatus: 8000000200006020 sbadaddr: 0000003fffa3e014 scause: 000000000000000f
    Segmentation fault
    root@ucbvax:~# ./1.riscv
    <BufferErrors St[  344.340000] 1.riscv[148]: unhandled signal 11 code 0x1 at 0x0000003fffb30050 in 1.riscv[10000+3000]
    art>
    
    continous[  344.350000] CPU: 0 PID: 148 Comm: 1.riscv Not tainted 4.20.0 #1
    
    
    loop
    
    <begin[  344.360000] sepc: 000000000001020a ra : 00000000000101c6 sp : 0000003fffb2fa20
     overflow read/w[  344.370000]  gp : 00000000000141a8 tp : 0000002000159720 t0 : 000000000001120c
    rite loop>
    
    [  344.370000]  t1 : 000000000000000f t2 : 0000002aaab85e70 s0 : 0000003fffb2fc80
    [  344.380000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 0000000000013f70
    [  344.390000]  a2 : 0000000000000001 a3 : 0000000000000008 a4 : ffffffffaabd7ba0
    [  344.400000]  a5 : 0000003fffb30050 a6 : 000000000000001f a7 : 0000000000000040
    [  344.410000]  s2 : 0000002aaabd7ba0 s3 : 0000002000017900 s4 : ffffffffffffffff
    [  344.410000]  s5 : 0000002aaabd7ae0 s6 : 0000002aaabaefa0 s7 : 0000002aaabd7a20
    [  344.420000]  s8 : 0000002aaabb5240 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  344.430000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  344.440000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  344.440000] sstatus: 8000000200006020 sbadaddr: 0000003fffb30050 scause: 000000000000000f
    Segmentation fault
    root@ucbvax:~# ./10.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./11.riscv
    <BufferErrors Start>
    
    continous[  350.350000] 11.riscv[150]: unhandled signal 11 code 0x1 at 0x0000003ffff7e9a8 in 11.riscv[10000+3000]
    
    
    <begin contin[  350.360000] CPU: 0 PID: 150 Comm: 11.riscv Not tainted 4.20.0 #1
    uous read/write>[  350.370000] sepc: 0000000000010260 ra : 0000000000010222 sp : 0000003ffff7dc10
    
    
    <end continuo[  350.380000]  gp : 0000000000014240 tp : 0000002000159720 t0 : 0000000000011266
    us read/write>
    
    [  350.390000]  t1 : 000000000000000f t2 : 0000002aaab85e70 s0 : 0000003ffff7dc80
    
    loop
    
    <begin o[  350.390000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 0000000000014008
    verflow read/wri[  350.400000]  a2 : 0000000000000001 a3 : 0000000000000008 a4 : 0000003ffff7dc18
    te loop>
    
    [  350.410000]  a5 : 0000003ffff7e9a8 a6 : 000000000000001f a7 : 0000000000000040
    [  350.420000]  s2 : 0000002aaabd7ca0 s3 : 0000002000017900 s4 : ffffffffffffffff
    [  350.430000]  s5 : 0000002aaabd7c60 s6 : 0000002aaabaefa0 s7 : 0000002aaabd7aa0
    [  350.430000]  s8 : 0000002aaabb5240 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  350.440000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  350.450000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  350.460000] sstatus: 8000000200006020 sbadaddr: 0000003ffff7e9a8 scause: 000000000000000d
    Segmentation fault
    root@ucbvax:~# ./12.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./13.riscv
    <BufferErrors St[  356.360000] 13.riscv[152]: unhandled signal 11 code 0x1 at 0x0000003fff87c5a8 in 13.riscv[10000+3000]
    art>
    
    continous[  356.370000] CPU: 0 PID: 152 Comm: 13.riscv Not tainted 4.20.0 #1
    
    
    loop
    
    <begin[  356.380000] sepc: 00000000000101fe ra : 00000000000101c0 sp : 0000003fff87aba0
     overflow read/w[  356.380000]  gp : 0000000000014350 tp : 0000002000159720 t0 : 0000000000011216
    rite loop>
    
    [  356.390000]  t1 : 000000000000000f t2 : 0000002aaab85e70 s0 : 0000003fff87ac70
    [  356.400000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 0000000000014048
    [  356.410000]  a2 : 0000000000000001 a3 : 0000000000000008 a4 : 0000003fff87abc0
    [  356.420000]  a5 : 0000003fff87c5a8 a6 : 000000000000001f a7 : 0000000000000040
    [  356.420000]  s2 : 0000002aaabd7d60 s3 : 0000002000017900 s4 : ffffffffffffffff
    [  356.430000]  s5 : 0000002aaabd7d20 s6 : 0000002aaabaefa0 s7 : 0000002aaabd7ba0
    [  356.440000]  s8 : 0000002aaabb5240 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  356.450000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  356.450000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  356.460000] sstatus: 8000000200006020 sbadaddr: 0000003fff87c5a8 scause: 000000000000000d
    Segmentation fault
    root@ucbvax:~# ./14.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./15.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./16.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./17.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./18.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./19.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./2.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./20.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./21.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./22.riscv
    <BufferErrors Start>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./23.riscv
    <BufferErrors Start>
    
    <valid ma[  389.410000] 23.riscv[163]: unhandled signal 11 code 0x1 at 0x0000000000016118 in 23.riscv[10000+3000]
    lloc result>
    
    c[  389.420000] CPU: 0 PID: 163 Comm: 23.riscv Not tainted 4.20.0 #1
    ontinous
    
    <begi[  389.430000] sepc: 0000000000010290 ra : 0000000000010252 sp : 0000003fff92cc40
    n continuous rea[  389.440000]  gp : 0000000000014458 tp : 0000002000159720 t0 : 00000000000112c0
    d/write>
    
    <end [  389.450000]  t1 : 0000000000014b18 t2 : 0000002aaab85e70 s0 : 0000003fff92cc70
    continuous read/[  389.450000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 0000000000014150
    write>
    
    loop
    
    [  389.460000]  a2 : 0000000000000001 a3 : 0000000000000008 a4 : 0000000000015010
    <begin overflow [  389.470000]  a5 : 0000000000016118 a6 : 0000000000016000 a7 : 0000000000000040
    read/write loop>[  389.480000]  s2 : 0000002aaabd8180 s3 : 0000002000017900 s4 : ffffffffffffffff
    
    
    [  389.490000]  s5 : 0000002aaabd8140 s6 : 0000002aaabaefa0 s7 : 0000002aaabd8000
    [  389.500000]  s8 : 0000002aaabd75b0 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  389.500000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  389.510000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  389.520000] sstatus: 8000000200006020 sbadaddr: 0000000000016118 scause: 000000000000000d
    Segmentation fault
    root@ucbvax:~# ./24.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./3.riscv
    <BufferErrors Start>
    
    <valid ma[  395.420000] 3.riscv[165]: unhandled signal 11 code 0x1 at 0x00000000000231a0 in 3.riscv[10000+3000]
    lloc result>
    
    c[  395.430000] CPU: 0 PID: 165 Comm: 3.riscv Not tainted 4.20.0 #1
    ontinous
    
    loop
    [  395.440000] sepc: 000000000001023a ra : 00000000000101f0 sp : 0000003fff801c40
    
    <begin overflo[  395.440000]  gp : 00000000000143c0 tp : 0000002000159720 t0 : 0000000000011268
    w read/write loo[  395.450000]  t1 : 0000000000014a80 t2 : 0000002aaab85e70 s0 : 0000003fff801c70
    p>
    
    [  395.460000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 00000000000140b8
    [  395.470000]  a2 : 0000000000000001 a3 : 0000000000000008 a4 : 0000000000000020
    [  395.480000]  a5 : 00000000000231a0 a6 : 0000000000018000 a7 : 0000000000000040
    [  395.480000]  s2 : 0000002aaabd8240 s3 : 0000002000017900 s4 : ffffffffffffffff
    [  395.490000]  s5 : 0000002aaabd8200 s6 : 0000002aaabaefa0 s7 : 0000002aaabd80c0
    [  395.500000]  s8 : 0000002aaabd75b0 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  395.510000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  395.510000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  395.520000] sstatus: 8000000200006020 sbadaddr: 00000000000231a0 scause: 000000000000000f
    Segmentation fault
    root@ucbvax:~# ./4.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./5.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./6.riscv
    <BufferErrors Start>
    
    <valid ma[  404.430000] 6.riscv[168]: unhandled signal 11 code 0x1 at 0x0000000000018688 in 6.riscv[10000+3000]
    lloc result>
    
    c[  404.440000] CPU: 0 PID: 168 Comm: 6.riscv Not tainted 4.20.0 #1
    ontinous
    
    <begi[  404.450000] sepc: 00000000000102a0 ra : 0000000000010258 sp : 0000003fffa95c40
    n continuous rea[  404.460000]  gp : 0000000000014460 tp : 0000002000159720 t0 : 00000000000112ce
    d/write>
    
    <end [  404.470000]  t1 : 0000000000014b20 t2 : 0000002aaab85e70 s0 : 0000003fffa95c70
    continuous read/[  404.470000]  s1 : 0000000000000000 a0 : 0000000000000000 a1 : 0000000000014158
    write>
    
    loop
    
    [  404.480000]  a2 : 0000000000000001 a3 : 0000000000000008 a4 : 0000000000017900
    <begin overflow [  404.490000]  a5 : 0000000000018688 a6 : 0000000000018000 a7 : 0000000000000040
    read/write loop>[  404.500000]  s2 : 0000002aaabd8360 s3 : 0000002000017900 s4 : ffffffffffffffff
    
    
    [  404.510000]  s5 : 0000002aaabd8320 s6 : 0000002aaabaefa0 s7 : 0000002aaabd81e0
    [  404.520000]  s8 : 0000002aaabb5240 s9 : 0000000000000000 s10: 0000002aaab8a7cc
    [  404.520000]  s11: 0000000000000000 t3 : 0000000000000000 t4 : 0000000000085968
    [  404.530000]  t5 : 0000000000000005 t6 : 0000000000000000
    [  404.540000] sstatus: 8000000200006020 sbadaddr: 0000000000018688 scause: 000000000000000f
    Segmentation fault
    root@ucbvax:~# ./7.riscv
    <BufferErrors Start>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./8.riscv
    <BufferErrors Start>
    
    <valid malloc result>
    
    continous
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# ./9.riscv
    <BufferErrors Start>
    
    continous
    
    <begin continuous read/write>
    
    <end continuous read/write>
    
    loop
    
    <begin overflow read/write loop>
    
    <end overflow read/write loop>
    
    done
    
    TEST COMPLETED
    root@ucbvax:~# 
    emulateTests.bufferErrors: Execution successful!
    shutdown -h now
    root@ucbvax:~# [[0;32m  OK  [0m] Stopped target [0;1;39mTimers[0m.
    [[0;32m  OK  [0m] Removed slice [0;1;39msystem-getty.slice[0m.
             Stopping [0;1;39mSystem Logging Service[0m...
    [[0;32m  OK  [0m] Stopped target [0;1;39mLogin Prompts[0m.
             Stopping [0;1;39mSerial Getty on ttyS0[0m...
    [[0;32m  OK  [0m] Stopped [0;1;39mSession c1 of user root[0m.
             Stopping [0;1;39mLogin Service[0m...
             Stopping [0;1;39mUser Manager for UID 0[0m...
    [[0;32m  OK  [0m] Stopped [0;1;39mOpenBSD Secure Shell server[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mSystem Logging Service[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mSerial Getty on ttyS0[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mUser Manager for UID 0[0m.
             Stopping [0;1;39mUser Runtime Directory /run/user/0[0m...
    [[0;32m  OK  [0m] Removed slice [0;1;39msystem-serial\x2dgetty.slice[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mLogin Service[0m.
    [[0;32m  OK  [0m] Unmounted [0;1;39m/run/user/0[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mUser Runtime Directory /run/user/0[0m.
    [[0;32m  OK  [0m] Removed slice [0;1;39mUser Slice of UID 0[0m.
             Stopping [0;1;39mPermit User Sessions[0m...
             Stopping [0;1;39mD-Bus System Message Bus[0m...
    [[0;32m  OK  [0m] Reached target [0;1;39mUnmount All Filesystems[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mD-Bus System Message Bus[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mPermit User Sessions[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mBasic System[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mSockets[0m.
    [[0;32m  OK  [0m] Closed [0;1;39mSyslog Socket[0m.
    [[0;32m  OK  [0m] Closed [0;1;39mD-Bus System Message Bus Socket[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mSlices[0m.
    [[0;32m  OK  [0m] Removed slice [0;1;39mUser and Session Slice[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mPaths[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mSystem Initialization[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mApply Kernel Variables[0m.
             Stopping [0;1;39mLoad/Save Random Seed[0m...
    [[0;32m  OK  [0m] Stopped target [0;1;39mLocal Encrypted Volumes[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mDispatch Password …ts to Console Directory Watch[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mForward Password R…uests to Wall Directory Watch[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mSwap[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mCreate Volatile Files and Directories[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mLocal File Systems[0m.
    [[0;32m  OK  [0m] Stopped target [0;1;39mLocal File Systems (Pre)[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mCreate Static Device Nodes in /dev[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mCreate System Users[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mLoad/Save Random Seed[0m.
    [[0;32m  OK  [0m] Stopped [0;1;39mRemount Root and Kernel File Systems[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mShutdown[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mFinal Step[0m.
    [[0;32m  OK  [0m] Started [0;1;39mPower-Off[0m.
    [[0;32m  OK  [0m] Reached target [0;1;39mPower-Off[0m.
    [  425.990000] printk: systemd-shutdow: 22 output lines suppressed due to ratelimiting
    [  426.810000] systemd-shutdown[1]: Syncing filesystems and block devices.
    [  426.840000] systemd-shutdown[1]: Sending SIGTERM to remaining processes...
    [  426.900000] systemd-journald[57]: Received SIGTERM from PID 1 (systemd-shutdow).
    [  426.990000] systemd-shutdown[1]: Sending SIGKILL to remaining processes...
    [  427.070000] systemd-shutdown[1]: Unmounting file systems.
    [  427.120000] [180]: Remounting '/' read-only in with options 'size=453544k,nr_inodes=113386'.
    [  427.140000] systemd-shutdown[1]: All filesystems unmounted.
    [  427.150000] systemd-shutdown[1]: Deactivating swaps.
    [  427.160000] systemd-shutdown[1]: All swaps deactivated.
    [  427.160000] systemd-shutdown[1]: Detaching loop devices.
    [  427.170000] systemd-shutdown[1]: All loop devices detached.
    [  427.180000] systemd-shutdown[1]: Detaching DM devices.
    [  427.260000] reboot: Power down
    Power off
    
    emulateTests.bufferErrors: fpga shut down successfully!
    testgen_BufferErrors.sh: fpga emulation ran successfully.
    Checked 25 log files:
        18 COMPLETED
         7 TRAPPED
         0 TIMED OUT
         0 INVALID
     -------------------------------------------- 
    |  TEST   | Score  |          Notes          |
     -------------------------------------------- 
    | CWE-118 | V-HIGH | 18/25 uncaught overruns |
    |---------|--------|-------------------------|
    | CWE-119 | V-HIGH | 18/25 uncaught overruns |
    |---------|--------|-------------------------|
    | CWE-120 |  HIGH  |  1/3 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-121 | V-HIGH |  2/4 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-122 | V-HIGH | 10/12 uncaught overruns |
    |---------|--------|-------------------------|
    | CWE-123 | V-HIGH | 12/16 uncaught overruns |
    |---------|--------|-------------------------|
    | CWE-124 | V-HIGH |  4/8 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-125 | V-HIGH |  6/9 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-126 |  HIGH  |  2/5 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-127 | V-HIGH |  4/4 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-129 | V-HIGH | 6/11 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-786 | V-HIGH | 12/12 uncaught overruns |
    |---------|--------|-------------------------|
    | CWE-787 | V-HIGH | 18/25 uncaught overruns |
    |---------|--------|-------------------------|
    | CWE-788 |  HIGH  | 6/13 uncaught overruns  |
    |---------|--------|-------------------------|
    | CWE-823 | V-HIGH | 12/14 uncaught overruns |
     -------------------------------------------- 
    `
};

export const Report: React.FC = () => {

    return (
        <Container className='Report'>
            <Header />
            <h1>Report</h1>
            <Container>
                <AceEditor
                    className='report-viewer'
                    mode='plain_text'
                    name='report-log'
                    readOnly={ true }
                    setOptions={{ useWorker: false }}
                    theme='monokai'
                    value={ sampleReport.log }
                    width='100%'
                    height='85vh' />
            </Container>
        </Container>
    );
};
