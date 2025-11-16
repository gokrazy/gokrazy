---
title: "NVMe disk (Pi 5)"
menuTitle: "NVMe disk (Pi 5)"
weight: 70
---

This page shows you how to use an M.2 NVMe disk on your Raspberry Pi 5 with gokrazy.

The high-level plan is:

1. Install an M.2 HAT (with compatible NVMe SSD disk) on your Pi 5.
1. Boot an SD card once on the Pi 5 to update the bootloader.
1. Write gokrazy to the NVMe disk.

## Step 1. Install an M.2 HAT

There are various products available to extend the Raspberry Pi 5 with an M.2
disk slot.

Unfortunately, all of them require compromises:

| Product                                                                           | fan?   | case?  | GPIO?  | M.2 form factor        |
|-----------------------------------------------------------------------------------|--------|--------|--------|------------------------|
| official [Pi M.2 HAT+](https://www.raspberrypi.com/products/m2-hat-plus/)         | ✅ yes | ❌ no  | ❌ no  | 2230, 2242             |
| official [Pi M.2 HAT+ Compact](https://www.raspberrypi.com/products/m2-hat-plus/) | ✅ yes | ✅ yes | ❌ no  | 2230                   |
| [Pimoroni NVMe Base](https://shop.pimoroni.com/products/nvme-base)                | ✅ yes | ❌ no  | ✅ yes | 2230, 2242, 2260, 2280 |

(All of the above products have been successfully tested with gokrazy.)

## Step 2. Bootloader update

On all three different Raspberry Pi 5 devices I tested, I needed to first update
the bootloader firmware (stored in the EEPROM) before the NVMe port would start
working.

You have multiple options for updating the firmware.

### Option A: gokrazy

If you don’t have a gokrazy instance yet, follow the [Quickstart](/quickstart/)
guide to create one.

Set the [`EEPROMPackage` instance config
field](/userguide/instance-config/#eeprompackage) as follows:

```json
{
…
    "EEPROMPackage": "github.com/gokrazy/rpi5-eeprom",
…
}
```

Once you boot this gokrazy system, the EEPROM will be updated.

If you want, you can customize the boot order by setting the
[`BootloaderExtraEEPROM` instance config
field](/userguide/instance-config/#bootloaderextraeeprom), for example:

```json
{
…
    "BootloaderExtraEEPROM": [
        "BOOT_ORDER=0xf16"
    ],
…
}
```

This [`BOOT_ORDER` setting
`0xf16`](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#BOOT_ORDER)
boots from NVMe disk first, then falls back to SD card.

### Option B: Raspberry Pi Imager

A gokrazy-managed bootloader (Option A) is the recommended way, but in case you
need a different option, you can install and start the official [Raspberry Pi
Imager](https://www.raspberrypi.com/software/).

Click “Operating System”, then chose *Misc utility images* → *Bootloader (Pi 5 family)* → *NVMe/USB Boot*.

Boot the created SD card and observe the green LED. The LED is solid green for a
few seconds, then starts blinking rapidly while the EEPROM is being written and
ultimately blinks slowly. If you have an HDMI screen connected, the screen turns
solid green once the EEPROM was written.

## Step 3. Using the NVMe disk

If you want, you can [mount the NVMe
disk](/userguide/instance-config/#mountconfig) as an extra storage device, which
requires no extra steps.

The rest of this section shows how to use the NVMe disk to store the entire
gokrazy system.

### Option A: Writing to the NVMe disk directly

The best way to write to the NVMe disk is to plug it into your computer, if you
have a spare M.2 slot.

If you don’t have an M.2 slot, you can use an USB M.2 NVMe SSD enclosure like
the [Icy Box
IB-1817M-C31](https://www.digitec.ch/de/s1/product/icy-box-gehaeuse-1x-nvme-ib-1817m-c31-m2-2260-m2-2242-m2-2230-m2-2280-festplattengehaeuse-10695604)
(costs about 25 bucks).

After plugging in the SSD, write gokrazy to it as usual:

```text
gok overwrite --full /dev/disk/by-id/…
```

### Option B: Copying a running system

If you don’t have a convenient way to write to an NVMe disk, you can boot
gokrazy from SD card on the Raspberry Pi 5, then log in via SSH (using
[breakglass](https://github.com/gokrazy/breakglass)) and copy the running
system.

After using the `breakglass` command to log into your gokrazy instance, you
should be able to list the `/dev/mmcblk*` and `/dev/nvme*` devices. With a fresh
NVMe disk, you would expect to see no partitions after `nvme0n1`, and four
partitions on `mmcblk0`:

```text
$ breakglass gokrazy
2025/11/16 16:46:54 checking breakglass status on gokrazy instance "gokrazy"
2025/11/16 16:46:54 polling SSH port to become available
2025/11/16 16:46:54 [ssh gokrazy.lan]
Warning: Permanently added 'gokrazy.lan' (RSA) to the list of known hosts.
              __                           
 .-----.-----|  |--.----.---.-.-----.--.--.
 |  _  |  _  |    <|   _|  _  |-- __|  |  |
 |___  |_____|__|__|__| |___._|_____|___  |
 |_____|  host:  "gokrazy"          |_____|
          model: Raspberry Pi 5 Model B Rev 1.0
          build: 2025-11-16T15:55:04+01:00

/tmp/breakglass4067757295 # ls -l /dev/mmcblk*
brw-------    1 0        0         179,   0 Nov 16 15:55 /dev/mmcblk0
brw-------    1 0        0         179,   1 Nov 16 15:55 /dev/mmcblk0p1
brw-------    1 0        0         179,   2 Nov 16 15:55 /dev/mmcblk0p2
brw-------    1 0        0         179,   3 Nov 16 15:55 /dev/mmcblk0p3
brw-------    1 0        0         179,   4 Nov 16 15:55 /dev/mmcblk0p4
/tmp/breakglass4067757295 # ls -l /dev/nvme*
crw-------    1 0        0         239,   0 Nov 16 15:55 /dev/nvme0
brw-------    1 0        0         259,   0 Nov 16 15:55 /dev/nvme0n1
/tmp/breakglass4067757295 # 
```

Copy the first 1100 MB, which includes the gokrazy boot partition and gokrazy
root A+B partitions, all of which are read-only and hence can be safely copied:

```text
/tmp # dd if=/dev/mmcblk0 of=/dev/nvme0n1 bs=1MB count=1100
1100+0 records in
1100+0 records out
1100000000 bytes (1.0GB) copied, 14.651804 seconds, 71.6MB/s
/tmp # poweroff
Connection to gokrazy.lan closed by remote host.
```

Unplug the SD card and the Pi will now boot from the NVMe disk.

Afterwards, [create a permanent partition](/userguide/permanent-data/) as usual
and copy your files from the SD card to the partition, e.g. using `scp` (quick
and built-in) or [`rsync` for larger transfers](/userguide/rsync-backups/).

TODO: the partition table is not updated with this approach, meaning the
permanent partition will be limited to the size of the SD card! See
https://github.com/gokrazy/gokrazy/issues/267 for details.
