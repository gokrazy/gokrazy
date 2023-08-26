---
title: "QEMU x86-64 virtual machine"
menuTitle: "QEMU x86-64 virtual machine"
weight: 70
---

In addition to running gokrazy on a Raspberry Pi or another ARM board, you can also run it in a QEMU x86-64 virtual
machine. The following guide covers what's necessary to build and run a gokrazy image on QEMU. Your hypervisor may require additional configuration.

## Building the image

### Create a new gokrazy instance

```bash
gok new -i virtual
```

The `-i` flag specifies the name of the instance. In this case, we're using `virtual`, but you can use any name you like. The instance configuration will be created in your home directory under `~/gokrazy/gok-vm`.

### Edit the instance configuration

Run `gok edit virtual` to open the [instance configuration](/userguide/instance-config) file in your favorite editor. You'll need to make the following changes:

{{< highlight json "hl_lines=3-4" >}}
{
  "Hostname": "virtual",
  "KernelPackage": "github.com/rtr7/kernel",
  "FirmwarePackage": "github.com/rtr7/kernel",
  // ...
}
{{< /highlight >}}

### Build the image

The following command will build a single image file that contains the kernel, firmware, and root filesystem. The `--target_storage_bytes` flag must be specified to set the size of the image. The example below creates a 4GB image.

```bash
GOARCH=amd64 gok overwrite -i virtual --full gok-vm.img --target_storage_bytes 4294967296
```

The image will be written to the current directory as `virtual.img`.

### Use the image with QEMU

You can now use the image with QEMU. The following command will boot the image in QEMU with a serial console:

```bash
qemu-system-x86_64 -machine accel=kvm -smp 8 -m 2048 -serial stdio -drive file=virtual.img,format=raw
```

### Use the image with Proxmox

You can also use the image with other hypervisors, such as [Proxmox PVE](https://www.proxmox.com/en/proxmox-virtual-environment/overview). Start by creating a new VM without a storage device. Then, upload the image to the Proxmox host and add it as a hard disk to the VM. 

```bash
qm importdisk <vmid> virtual.img <storage>

# for example, for vmid 105 and local-zfs storage:
qm importdisk 105 virtual.img local-zfs
```

Visit the Proxmox web UI and choose the unattached disk on the VM Hardware tab. Click "Edit" and select "SCSI" as the
Bus/Device. Click "Add" to add the disk to the VM. Visit the "Options" tab and edit "Boot Order". Make sure the SCIS
disk is checked and move it to the top of the list. Click "OK" to save your changes.

### Bonus: Deploy a QEMU guest agent

If you're using Proxmox PVE, you can deploy a QEMU guest agent to the VM. This will allow you to discover the VM's IP address. The [qemu-guest-kragent](https://github.com/bradfitz/qemu-guest-kragent) project provides a simple agent that can be used with gokrazy.

To add the agent to your gokrazy instance, run the following command:

```bash
gok -i virtual add github.com/bradfitz/qemu-guest-kragent
```

Visit the Proxmox web UI and choose the VM. Click "Options" and select "QEMU Guest Agent". Make sure "Use QEMU Guest Agent" is checked. Click "OK" to save your changes.

### Tips: Optimizing the VM

The following tips can be used to optimize the VM and reduce CPU usage:

- Disable USB hotplug
- Disable USB tablet/pointer support
- Use the VirtIO graphics support. On Proxmox either "VirtIO-GPU" graphic card or `vga: virtio` in the config file.


### Next steps

You can now use this gokrazy VM instance as you would any other gokrazy instance. For example, you can add packages,
configure the instance, and update it.

```bash
GOARCH=amd64 gok -i virtual update
```

For more information, see the [Instance config reference](/userguide/instance-config/).
