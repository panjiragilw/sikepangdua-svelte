<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Input, Label, Modal, Radio, Select } from 'flowbite-svelte';
  import type { OrganizationalUnit, UserModalProps } from './types';
  import type { Rank, WorkUnit } from '$lib/types'

  const dispatch = createEventDispatcher();

  let { open = $bindable(true), data }: UserModalProps = $props();
  // Variabel untuk menyimpan nilai yang dipilih
  let positionType = $state('administrative');
  let employeeType = $state('pns');
  let parentAgency = $state('oikn');
  let otherAgency = $state('');
  let sdsLastGroupDate = $state('');
  let selectedRankId: string = $state(""); 
  let selectedOrgUnitId: string = $state(""); 
  let selectedWorkUnitId: string = $state(""); 


  // Svelte Runes: Effect to reset state when switching from Edit to Add
  $effect(() => {
    // Check if the component should be in 'Add' mode (data is empty/new)
    // We check if Object.keys(data).length is 0 OR if the modal is actively opened (open = true)
    
    // Check if data has been reset (e.g., when closing Edit and preparing to Add)
    if (Object.keys(data).length === 0) {
      // console.log('Resetting state for Add mode.');
      // Reset all state variables to their defaults
      positionType = 'administrative';
      employeeType = 'pns';
      parentAgency = 'oikn';
      otherAgency = '';
      sdsLastGroupDate = '';
      selectedRankId = '';
      selectedOrgUnitId = '';
      selectedWorkUnitId = '';
    }
  });

  // Function for handling radio button changes for parent agency
  function handleAgencyChange(e: Event) {
    parentAgency = (e.target as HTMLInputElement).value;
  }

  function init(form: HTMLFormElement) {
    if (data?.group_class) [data.group, data.class] = data.group_class.split('/');    
    for (const key in data) {
      switch (key) {
        case 'employee_type':
          employeeType = data[key];
          break;
        case 'position_type':
          positionType = data[key];
          break;
        case 'parent_agency':
           // Logic for handling 'other' agency and setting state
          parentAgency = ['oikn', 'other'].includes(data[key]) ? data[key] : 'other';
          if (parentAgency === 'other') {
            otherAgency = data[key];
          }
          break;
        case 'sds_last_group':
          sdsLastGroupDate = data[key] || "";
          break;
        case 'rank_id':
          selectedRankId = data[key];
          break;
        case 'organizational_unit_id':
          selectedOrgUnitId = data[key];
          break;
        case 'work_unit_id':
          selectedWorkUnitId = data[key];
          break;
      }

      const el = form.elements.namedItem(key);
      
      if (el) {
        if (el instanceof HTMLInputElement) {
          el.value = data[key];
        } else if (el instanceof HTMLTextAreaElement) {
          el.value = data[key];
        }
      }
    }
  }

  // Function to handle form submission (Add or Save)
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault(); // Stop default form submission/page reload
    // console.log("onSubmit");
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // 1. Collect all form data (including standard inputs)
    const payload: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }
    
    // 2. Add custom state values (Radio Buttons)
    payload.employee_type = employeeType;
    payload.position_type = positionType;
    
    // 3. Handle Parent Agency conditional input
    payload.parent_agency = (parentAgency === 'other' && otherAgency) 
                            ? otherAgency // Use the text input value
                            : parentAgency; // Use 'oikn' or 'other' flag if text is empty

    // 4. Add date input
    payload.sds_last_group = sdsLastGroupDate;

    // 5. Determine Action Type (Add or Save)
    const isEditMode = Object.keys(data).length > 0;
    
    if (isEditMode) {
      // Include original ID for update/edit
      payload.id = data.id; 
      // console.log('SAVE (EDIT) Payload:', payload);
      // Dispatch event untuk update
      dispatch('saveEmployee', payload);
    } else {
      // console.log('ADD (NEW) Payload:', payload);
      // Dispatch event untuk add baru
      dispatch('addEmployee', payload);
    }

    // Close the modal after submission (optional)
    open = false;
  }

  type ApiRankListResponseSuccess = { status: number; data: Rank[] };
  type ApiOrganizationalUnitListResponseSuccess = { status: number; data: OrganizationalUnit[] };
  type ApiListResponseError = { status: number; error: string; logMsg: string };
  let ranks = $state<Rank[] | undefined>(undefined);
  let orgUnits = $state<OrganizationalUnit[] | undefined>(undefined);
  let workUnits = $state<WorkUnit[] | undefined>(undefined);
  let error = $state<string | null>(null);

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

  async function fetchOrgUnit(): Promise<void> {
    const apiURL = `http://localhost:9091/api/unit/organizational-units`;
    try {
      const res = await fetch(apiURL);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const json = (await res.json()) as ApiOrganizationalUnitListResponseSuccess | ApiListResponseError;
      if (json.status !== 200) {
        const errJson = json as ApiListResponseError;
        throw new Error(errJson.error);
      }
      const successResponse = json as ApiOrganizationalUnitListResponseSuccess;
      orgUnits = successResponse.data;
    } catch (e: any) {
      error = e.message;
    } finally {
      // console.log("org units: ", orgUnits);
    }
  }

  // interface ApiPayload {
  //   rank_id: number | null;
  //   group_class_id: number | null;
  //   work_unit_id: number | null;
  //   org_unit_id: number | null;
  //   // Add other payload properties
  // }


  // let sRank: Rank | null = $state(null);
  // 2. Variable untuk Object lengkap. Harus berupa $derived dari ID.
  // Ini yang akan digunakan untuk Group/Class display
  let sRank: Rank | null = $derived(
      ranks?.find(r => r.id === (selectedRankId ? Number(selectedRankId) : null)) || null
  );

  let sOrgUnit: OrganizationalUnit | null = $derived(
      orgUnits?.find(r => r.id === (selectedOrgUnitId ? Number(selectedOrgUnitId) : null)) || null
  );

  let isWorkUnitDisabled: boolean = $derived(!selectedOrgUnitId);

  function handleOrgUnitChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    // selectedOrgUnitId = target.value; 
    // console.log("target val: ", target.value);

    // **LOGIKA PENTING:**
    // Aktifkan Work Unit jika ada ID yang dipilih (bukan string kosong atau null)
    isWorkUnitDisabled = !target.value;
    selectedWorkUnitId = ""
  }

  onMount(() => {
    fetchRankList();
    fetchOrgUnit();
  });
</script>

<Modal bind:open title={Object.keys(data).length ? 'Edit employee' : 'Add new employee'} size="md" class="m-4">
  <!-- Modal body -->
  <div class="space-y-6 p-0">
    <form id="employee-form" onsubmit={handleSubmit} use:init>
      <div class="grid grid-cols-6 gap-6">
        <!-- <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>First Name</span>
          <Input name="first_name" class="border outline-none" placeholder="e.g. Bonnie" required />
        </Label> -->
        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>Full Name</span>
          <Input name="name" class="border outline-none" placeholder="e.g. John Doe" required />
        </Label>
        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>EIN</span>
          <Input name="ein" class="border outline-none" placeholder="e.g. 191204121974111001" required/>
        </Label>
        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>Rank</span>
          <Select 
            name="rank_id" 
            bind:value={selectedRankId}
            placeholder="Choose Rank" required>
           {#each ranks || [] as {id, name, group_class_name}}
              <option value={id}>
                  {name} ({group_class_name})
              </option>
            {/each}
          </Select>
        </Label>

        <div class="grid grid-cols-12 gap-4"> 
          <Label class="col-span-6 space-y-2">
            <span>Group</span>
            <Input 
                name="group_display" 
                class="border outline-none w-full bg-gray-100 cursor-not-allowed" 
                value={sRank ? sRank.group : ''}
                readonly 
            />
            
            <Input 
                type="hidden" 
                name="group_class_id" 
                value={sRank ? sRank.group_class_id : ''} 
            />
          </Label>
          
          <Label class="col-span-6 space-y-2">
            <span>Class</span>
            <Input 
                name="class_display" 
                class="border outline-none w-full bg-gray-100 cursor-not-allowed" 
                value={sRank ? sRank.class : ''}
                readonly 
            />
          </Label>
      </div>

      <!-- <div class="grid grid-cols-12 gap-4">  -->
       <Label class="col-span-6 space-y-2 sm:col-span-3">
        <span>Organizational Unit</span>
        <Select 
          name="org_unit_id" 
          bind:value={selectedOrgUnitId}
          placeholder="Choose Organizational Unit" required
          onchange={handleOrgUnitChange}
          >
          {#each orgUnits || [] as {id, name}}
            <option value={id}>
                {name}
            </option>
          {/each}
        </Select>
      </Label>

      <Label class="col-span-6 space-y-2 sm:col-span-3">
        <span>Work Unit</span>
        <Select 
          name="work_unit_id" 
          bind:value={selectedWorkUnitId}
          placeholder="Choose Work Unit" required disabled={isWorkUnitDisabled}>
          {#each sOrgUnit?.work_units || [] as {id, name}}
            <option value={id}>
                {name}
            </option>
          {/each}
        </Select>
      </Label>
      <!-- </div> -->

        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>Position</span>
          <Input name="position" class="border outline-none" placeholder="e.g. Analis Sumber Daya Manusia Ahli Madya" required />
        </Label>
        <!-- <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>Work Unit</span> -->
          <!-- TODO: change to select, fetch from API -->
          <!-- <Input name="work_unit" class="border outline-none" placeholder="e.g. Biro Sumber Daya Manusia dan Hubungan Masyarakat" required />
        </Label> -->

        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>SDS (Start Date of Service) Last Group:</span>
          <Input 
            type="date" 
            name="sds_last_group" 
            bind:value={sdsLastGroupDate} 
            required 
            class="w-full"
          />
        </Label>
          
        <div class="col-span-6 sm:col-span-3 space-y-2">
          <Label class="block mb-2">Employee Type:</Label>
          <div class="flex flex-col gap-1">
            <Radio bind:group={employeeType} value="pns">PNS</Radio>
            <Radio bind:group={employeeType} value="cpns">CPNS</Radio>
            <Radio bind:group={employeeType} value="p3k">P3K</Radio>
            <Radio bind:group={employeeType} value="non-asn">Non-ASN</Radio>
          </div>
        </div>

        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>Parent Agency:</span>
          <div class="flex flex-wrap gap-4 mb-3">
          <Radio onchange={handleAgencyChange} value="oikn" bind:group={parentAgency}>OIKN</Radio>
            <Radio onchange={handleAgencyChange} value="other" bind:group={parentAgency}>Other</Radio>
          </div>

          {#if parentAgency === 'other'}
            <Input 
              type="text" 
              bind:value={otherAgency} 
              placeholder="eg. Kementerian PU"
              required
            />
          {/if}
        </Label>

        <div class="col-span-6 sm:col-span-3 space-y-2">
          <Label class="block mb-2">Position Type:</Label>
          <div class="flex flex-col gap-1">
            <Radio bind:group={positionType} value="structural">Structural</Radio>
            <Radio bind:group={positionType} value="functional">Functional</Radio>
            <Radio bind:group={positionType} value="administrative">Administrative</Radio>
          </div>
        </div>

        <!-- <div class="mb-6"> -->
        <!-- </div> -->


        <!-- <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>Current Password</span>
          <Input name="current-password" type="password" class="border outline-none" placeholder="••••••••" required />
        </Label>
        <Label class="col-span-6 space-y-2 sm:col-span-3">
          <span>New Password</span>
          <Input name="news-password" type="password" class="border outline-none" placeholder="••••••••" required />
        </Label> -->

        <!-- <Label class="col-span-6 space-y-2">
          <span>Biography</span>
          <Textarea id="biography" rows={4} class="w-full bg-gray-50 outline-none dark:bg-gray-700" placeholder="👨‍💻Full-stack web developer. Open-source contributor.">
            👨‍💻Full-stack web developer. Open-source contributor.
          </Textarea>
        </Label> -->
      </div>
    </form>
  </div>

  <!-- Modal footer -->
  {#snippet footer()}
    <Button type="submit" form="employee-form">{Object.keys(data).length ? 'Save all' : 'Add employee'}</Button>
  {/snippet}
</Modal>

<!--
@component
[Go to docs](https://flowbite-svelte-admin-dashboard.vercel.app/)
## Type
[UserModalProps](https://github.com/themesberg/flowbite-svelte-admin-dashboard/blob/main/src/lib/types.ts#L244)
## Props
@prop open = $bindable(true)
@prop data
-->
