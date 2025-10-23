<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { Button, Heading, Input, Label, Select, Textarea, Drawer, P } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import type { DocumentPoolDrawerProps } from './types';
  import type { Attachment } from 'svelte/attachments';
  import type { Rank } from '$lib/types'

  let { open = $bindable(false), title = 'Promoted Employee', data = {}, documents = [], prefilledUrls = $bindable({}), additionalFields = [], ...formAttrs }: DocumentPoolDrawerProps = $props();

  const dispatch = createEventDispatcher();

  const prefill: Attachment<HTMLFormElement> = (form) => {
    // console.log("form: ", form)
    const fill = (vals: Record<string, unknown> = {}) => {
      // console.log("vals: ", vals)
      for (const [key, value] of Object.entries(vals)) {
        if (value == null) continue;

        // Try to find the element using multiple approaches
        let el = form.elements.namedItem(key) as HTMLElement | null;

        // If not found with namedItem, try querySelector
        if (!el) {
          el = form.querySelector(`[name="${key}"]`);
        }

        // If still not found, try finding by name attribute in the entire form
        if (!el) {
          el = form.querySelector(`input[name="${key}"], select[name="${key}"], textarea[name="${key}"]`);
        }

        if (!el) {
          // console.warn(`Could not find form element with name: ${key}`);
          continue;
        }

        // Handle different input types
        if (el instanceof HTMLInputElement) {
          el.value = String(value);
        }
      }
    };

    setTimeout(() => {
      fill(data);
    }, 50);

    return () => {
      // Cleanup function (optional)
    };
  };

  let uploading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    const initialFormData = new FormData(form);

    const payload: { [key: string]: any } = {
      id: data.id,
    };
    for (const [key, value] of initialFormData.entries()) {
      payload[key] = value;
    }

    dispatch('promoted', payload);
    console.log("DISPATCHED promoted: ", payload);
    
    open = false;
  }

  type ApiRankListResponseSuccess = { status: number; data: Rank[] };
  type ApiListResponseError = { status: number; error: string; logMsg: string };

  let ranks = $state<Rank[] | undefined>(undefined);
  let error = $state<string | null>(null);

  let selectedRankId: string = $state("");
  let sdsLastGroupDate = $state(''); 
  let currentEmployeeRankId: number = $derived(Number(data.rank_id) || 0);
  let currentRankName: string = $derived(String(data.rank_name) || "");
  let currentGroupClassName: string = $derived(String(data.group_class_name) || "");
  let isEligible: boolean = $derived(Boolean(data.is_eligible) || false); 
        
  async function fetchRankList(): Promise<void> {
    const apiURL = `http://localhost:9091/api/employee/ranks`;
    try {
      const res = await fetch(apiURL);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const json = (await res.json()) as ApiRankListResponseSuccess | ApiListResponseError;
      if (json.status !== 200) {
        const errJson = json as ApiListResponseError;
        throw new Error(errJson.error);
      }
      const successResponse = json as ApiRankListResponseSuccess;
      ranks = successResponse.data;
    } catch (e: any) {
      error = e.message;
    } finally {
      // console.log("ranks: ", ranks);
      // console.log("sleected Id: ", selectedRankId);
    }
  }

  let sRank: Rank | null = $derived(
      ranks?.find(r => r.id === (selectedRankId ? Number(selectedRankId) : null)) || null
  );

  // console.log(sRank);

  onMount(() => {
    fetchRankList();
  });

</script>

<Drawer placement="right" bind:open>
  <Heading tag="h5" class="mb-6 text-sm font-semibold uppercase">
    {title}
  </Heading>

  <form onsubmit={(e) => {
    e.preventDefault();
    handleSubmit(e);
  }} {...formAttrs} {@attach prefill} class="relative h-full flex flex-col">
    <!-- Konten scrollable -->
    <div class="flex-1 overflow-y-auto px-4 pt-2 pb-32 space-y-4">
      <Label class="space-y-2">
        <span>Eligibility Status</span>
        {#if isEligible} 
          <P size="lg" class="text-green-600 dark:text-green-500">Eligible</P>
        {:else}
          <P size="lg" class="text-red-600 dark:text-red-400">Not Eligible</P>
        {/if}

      </Label>

      <Label class="space-y-2">
        <span>Name</span>
        <Input name="name" class="border font-normal outline-none" placeholder="Type product name" required readonly />
      </Label>

      <Label class="space-y-2">
        <span>EIN</span>
        <Input name="ein" class="border font-normal outline-none" placeholder="Type EIN" required readonly />
      </Label>

      <Label class="col-span-6 space-y-2 sm:col-span-3">
        <span>Promoted to</span>
        <P size="xs">
          Current: {currentRankName} ({currentGroupClassName})
        </P>
        <!-- TODO: add label current rank above of select option -->
        <Select 
          name="rank_id" 
          bind:value={selectedRankId}
          placeholder="Choose Rank" required>
          {#each ranks || [] as {id, name, group_class_name}}
            <option value={id} disabled={id <= currentEmployeeRankId}>
                {name} ({group_class_name})
            </option>
          {/each}
        </Select>

        <Input 
          type="hidden" 
          name="group_class_id" 
          value={sRank ? sRank.group_class_id : ''} 
        />
      </Label>

      <Label class="col-span-6 space-y-2 sm:col-span-3">
        <span>SDS (Start Date of Service):</span>
        <Input 
          type="date" 
          name="sds_last_group" 
          bind:value={sdsLastGroupDate} 
          required 
          class="w-full"
        />
      </Label>

    </div>

    <!-- Tombol floating -->
    <div class="sticky bottom-0 bg-white px-4 py-4 border-t z-10">
      {#if uploading}
       <div class="px-4 py-2 text-sm text-gray-500 italic text-center">
         Updating data, please wait...
       </div>
      {/if}
      <div class="flex justify-center space-x-4">
        <Button type="submit" class="w-full" disabled={!isEligible}>Promoted</Button>
        <Button color="alternative" class="w-full" onclick={() => {(open = false)}}>
          <CloseOutline />
          Cancel
        </Button>
      </div>
    </div>
  </form>
</Drawer>