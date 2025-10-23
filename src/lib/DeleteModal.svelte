<script lang="ts">
  import { Button, Modal } from 'flowbite-svelte';
  import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
  import type { DeleteModalProps } from './types';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ confirm: boolean; cancel: void }>();

  let { open = $bindable(true), title = 'Are you sure you want to delete this?', yes = "Yes, I'm sure", no = 'No, cancel' }: DeleteModalProps = $props();

  // Fungsi untuk tombol 'Yes'
  function handleConfirm() {
    open = false; // Tutup modal
    dispatch('confirm', true); // Dispatch event 'confirm' dengan payload true
  }
</script>

<Modal bind:open size="sm">
  <ExclamationCircleOutline class="mx-auto mt-8 mb-4 h-10 w-10 text-red-600" />

  <h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-300">{title}</h3>

  <div class="flex items-center justify-center">
    <Button color="red" class="mr-2" onclick={handleConfirm}>{yes}</Button>
    <Button color="alternative" onclick={() => (open = false)}>{no}</Button>
  </div>
</Modal>

<!--
@component
[Go to docs](https://flowbite-svelte-admin-dashboard.vercel.app/)
## Type
[DeleteModalProps](https://github.com/themesberg/flowbite-svelte-admin-dashboard/blob/main/src/lib/types.ts#L237)
## Props
@prop open = $bindable(true)
@prop title = 'Are you sure you want to delete this?'
@prop yes = "Yes, I'm sure"
@prop no = 'No, cancel'
-->
