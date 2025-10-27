<script lang="ts">
  import { onMount } from "svelte";
  import { Breadcrumb, BreadcrumbItem, Button, Checkbox, Heading, Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toolbar, ToolbarButton, P, Popover, List, Li, Hr } from 'flowbite-svelte';
  import { QuestionCircleSolid, EyeOutline, CloseCircleSolid, AwardOutline } from 'flowbite-svelte-icons';
  import type { Component } from 'svelte';
  import MetaTag from '../../../utils/MetaTag.svelte';
  import { DeleteDrawer, DocumentPoolDrawer, hostPort, PromotionDrawer } from '$lib';
  import type {API_Pagination, RegularPromotionCheckResult, LegalDocument, PromotionWithCategory} from '$lib/types'

  let openDocument: boolean = $state(false);
  let openPromoted: boolean = $state(false); // modal control

  let employees_data: any = $state({});
  let tableLoading = $state(false);
  let searchQuery = $state('');

  const path: string = '/promotions/regular';
  const description: string = 'Employee Regular Promotion Page';
  const title: string = 'Employee Promotions (Regular)';
  const subtitle: string = 'Regular Promotion';

  type Sort = { sort_by: string; order_by: "asc" | "desc" };
  type Meta = { pagination: API_Pagination; sort: Sort };
  type ApiPromotionListResponseSuccess = { status: number; data: RegularPromotionCheckResult; meta: Meta };
  type ApiPromotionListResponseError = { status: number; error: string; logMsg: string };

  let promotions = $state<RegularPromotionCheckResult | undefined>(undefined);
  let meta = $state<Meta | undefined>(undefined);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function fetchPromotionList(
    name?: string
  ): Promise<void> {
    let apiURL = `/api/employee/check-promotion/regular/list`;
    let urlQuery: string = ""
    
    if (name && name != "") {
      urlQuery += `&name=${name}`;
    }
    if (urlQuery != "") {
      apiURL += `?${urlQuery}`
    }

    try {
      const res = await fetch(apiURL);
      // if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const contentType = res.headers.get('content-type') ?? '';
      if (!res.ok || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("Unexpected response:", text.slice(0, 100));
        throw new Error(`Unexpected response: ${res.status}`);
      }
      const json = (await res.json()) as ApiPromotionListResponseSuccess | ApiPromotionListResponseError;
      if (json.status !== 200) {
        const errJson = json as ApiPromotionListResponseError;
        throw new Error(errJson.error);
      }
      const successResponse = json as ApiPromotionListResponseSuccess;
      promotions = successResponse.data;
      meta = successResponse.meta;      
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  let legalDocs = $state<LegalDocument[] | undefined>(undefined);

  export const overdues = $state<Array<PromotionWithCategory>>([]);
  export const dueSoon = $state<Array<PromotionWithCategory>>([]);
  export const upcomings = $state<Array<PromotionWithCategory>>([]);
  export const employeePromotions = $state<Array<PromotionWithCategory>>([]);

  let eligibleCount = $state(0);
  let notEligibleCount = $state(0);

  export const dark = $state(false);

  async function fetchData(
    name?: string
  ) {
    tableLoading = true;
    try {
        const [_, successResponse] = await Promise.all([
            new Promise(resolve => setTimeout(resolve, 300)),
            fetchPromotionList(name)
        ]);
        
        const overdueList = (promotions?.regular_promotions?.overdue_promotions ?? []).map(p => ({
            ...p,
            category: 'overdue' as const 
        })) as PromotionWithCategory[];
        
        const soonList = (promotions?.regular_promotions?.due_soon_promotions ?? []).map(p => ({
            ...p,
            category: 'soon' as const 
        })) as PromotionWithCategory[];
        
        const upcomingList = (promotions?.regular_promotions?.upcoming_promotions ?? []).map(p => ({
            ...p,
            category: 'upcoming' as const
        })) as PromotionWithCategory[];

        overdues.splice(0, overdues.length, ...overdueList);
        dueSoon.splice(0, dueSoon.length, ...soonList);
        upcomings.splice(0, upcomings.length, ...upcomingList);

        employeePromotions.splice(0, employeePromotions.length, ...overdues, ...dueSoon, ...upcomings);

        eligibleCount = promotions?.eligible_count ?? 0;
        notEligibleCount = (promotions?.total_count ?? 0) - (promotions?.eligible_count ?? 0);

    } catch (e) {
        console.error("Error during data fetching and delay:", e);
    } finally {
        tableLoading = false; 
    }
  }

  // Fungsi Debounce Helper
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function(this: any, ...args: Parameters<T>) {
        const context = this;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
  }

  // Fungsi fetch yang akan dipanggil setelah debounce
  const debouncedFetchEmployees = debounce((query: string) => {
    if (query.length > 2 || query.length === 0) {
      // Panggil API fetch employee list Anda di sini
      fetchData(query);
      // console.log(`[API CALL] Searching for: ${query}`);
    }
  }, 1000); // 1000ms (1 detik) delay

  // Svelte Runes: Effect untuk memantau perubahan searchQuery
  $effect(() => {
      // Hanya panggil debounce jika query telah berubah
      debouncedFetchEmployees(searchQuery);
  });

  const toggle = async (ein: string) => {
    // DrawerComponent = component;
    // openDocument = true;

    try {
      const res = await fetch(`/api/employee/documents/legal?ein=${ein}`);
      // if (!res.ok) throw new Error(`Failed to fetch documents`);
      const contentType = res.headers.get('content-type') ?? '';
      if (!res.ok || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("Unexpected response:", text.slice(0, 100));
        throw new Error(`Unexpected response: ${res.status}`);
      }
      const json = await res.json();
      legalDocs = []; // reset first
      legalDocs = json.data as LegalDocument[]; // assign new array
    } catch (e) {
      console.error('Error fetching legal documents:', e);
      legalDocs = [];
    } finally {
      // console.log("legalDocs: ", legalDocs);
      
    }
  };

  function reasonFormatter(reason: string) {
    return reason.replace("Missing required document: ", "");
  }

  // Handle document of promoted employee
  async function handleDocumentPromoted(e: CustomEvent) {
    e.preventDefault();
    const payload = e.detail;
    // console.log("payload: ", payload);
    
    const promotedFile = payload['sk-kpbr'] as File;

    const skp1DocId = payload['skp_1_doc_id'] || payload.skp_1_doc_id; // Cek mana yang benar di payload Anda
    const skp2DocId = payload['skp_2_doc_id'] || payload.skp_2_doc_id;
    const skKpDocId = payload['sk_kp_doc_id'] || payload.sk_kp_doc_id;

    if (!(promotedFile instanceof File) || promotedFile.size === 0) {
        console.error("No valid promotion file found in payload.");
        return;
    }

    try {
        // 3. Build the final FormData for the API call
        const uploadFormData = new FormData();
        
        // Append all required IDs (pastikan tipe data di payload Anda adalah string atau number)
        uploadFormData.append('skp_1_doc_id', skp1DocId.toString());
        uploadFormData.append('skp_2_doc_id', skp2DocId.toString());
        uploadFormData.append('sk_kp_doc_id', skKpDocId.toString());
        
        // Ambil employee ID dari payload
        uploadFormData.append('employee_id', payload.id.toString()); 
        
        // Append document type ID (asumsi hardcoded '17' adalah tipe untuk SK-KPBR)
        uploadFormData.append('document_type_id', "17"); 
        
        // Append the actual file
        uploadFormData.append('document_file', promotedFile);

        // 4. Execute the single API call
        const res = await fetch('/api/employee/promoted', {
            method: 'POST',
            body: uploadFormData, 
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Upload failed. Status: ${res.status}. Response: ${errorText}`);
        }
        
        console.log("Promotion document uploaded and data updated successfully.");

    } catch (e) {
        console.error("Failed to handle promotion document:", e);
    }
  }

  // Handle promoted employee
  async function handlePromotedEmployee(e: CustomEvent) {
    const payload = e.detail; 
    // console.log("Receive event PROMOTE) with payload:", payload);
    
    // Hit API handle promoted employee docs
    await handleDocumentPromoted(e);

    const allowedKeysStr = [ 
      "sds_last_group", 
    ];
    const allowedKeysNumber = [
      "rank_id",
      "group_class_id",
    ];
    const jsonPayload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (allowedKeysStr.includes(key)) {
        // console.log(key, value);
        jsonPayload[key] = String(value ?? '');
      } else if (allowedKeysNumber.includes(key)) {
        // console.log(key, value);
        jsonPayload[key] = Number(value ?? 0);
      }
    }

    // console.log("UPDATE PROMOTE with:", jsonPayload);
    // return;

    // Hit API update employee
    try {
      const jsonPayloadStr = JSON.stringify(jsonPayload);
      // console.log("jsonPayloadStr: ", jsonPayloadStr);
      const res = await fetch(`/api/employee/${payload.id}`, {
        method: 'PUT',
        body: jsonPayloadStr, 
        headers: {
            'Content-Type': 'application/json',
        },
      });

      // Cek status HTTP. Di sini diasumsikan status 2xx adalah sukses
      if (!res.ok) {
        console.error(`Edit failed. Status: ${res.status}`, jsonPayload);
      } 
      // Tutup modal setelah sukses
      // openEmployee = false;
      // Muat ulang data tabel
      // searchQuery = "";
      fetchData(); 
    } catch (e) {
      console.error("Failed to edit:", e);
    }
  }

  onMount(fetchData);
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
  <h1 class="hidden">Promotion: Regular</h1>
  <div class="p-4">
    <Breadcrumb class="mb-5">
      <BreadcrumbItem home>Home</BreadcrumbItem>
      <BreadcrumbItem>Promotions</BreadcrumbItem>
      <BreadcrumbItem>Regular</BreadcrumbItem>
    </Breadcrumb>
    <Heading tag="h1" class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Employee Promotion (Regular)</Heading>
  
    <Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-300">
      <Input 
        placeholder="Search for employees" 
        class="me-4 w-80 border xl:w-96" 
        bind:value={searchQuery}
      />
    </Toolbar>
  </div>

  <div class="relative"> 
    {#if tableLoading}
      <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 z-20">
        <div role="status" class="flex flex-col items-center">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9188 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1951 81.2882 10.7232 75.8152 7.42211C70.4326 3.86937 64.6396 0.99955 58.4212 1.49363C50.5023 2.1915 42.7937 5.72727 37.0001 11.214C30.4927 17.8841 26.6669 26.3887 25.4485 35.474C23.5135 44.0762 25.6698 52.6563 30.4853 59.7915C36.0163 67.9272 44.6473 73.5593 54.5126 75.567C63.6366 77.4042 72.9304 75.9892 81.334 71.9567C86.974 69.3403 91.6881 65.2347 94.6179 60.0827Z" fill="url(#a)"/></svg>
          <span class="text-sm font-semibold text-gray-900 dark:text-white mt-2">Memuat Data Terbaru...</span>
        </div>
      </div>
    {/if}
  </div>
  <Table class={tableLoading ? 'opacity-50' : ''}>
    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
      <TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
      {#each ['Employee Name', 'Rank', 'Group/Class', 'SDS Last Group', 'Expected Promotion Date', 'Eligibility', 'Action'] as title}
        <TableHeadCell class="ps-4 font-normal">{title}</TableHeadCell>
      {/each}
    </TableHead>
    <TableBody>
      {#each employeePromotions as promotion}
        <TableBodyRow class="text-base">
          <TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
          <TableBodyCell class="flex items-center space-x-6 p-4 whitespace-nowrap">
            <div class="text-sm font-normal text-gray-500 dark:text-gray-300">
              <div class="text-base font-semibold text-gray-900 dark:text-white">
                {promotion.name}
              </div>
              <div class="text-sm font-normal text-gray-500 dark:text-gray-300">
                {promotion.ein}
              </div>
            </div>
          </TableBodyCell>
          <TableBodyCell class="p-4">{promotion.rank}</TableBodyCell>
          <TableBodyCell class="p-4">{promotion.group_class}</TableBodyCell>
          <!-- <TableBodyCell class="max-w-sm truncate overflow-hidden p-4 text-base font-normal text-gray-500 xl:max-w-xs dark:text-gray-300">x</TableBodyCell> -->
          <TableBodyCell class="p-4">{promotion.sds_last_group}</TableBodyCell>
          <TableBodyCell class="p-4">{promotion.expected_promotion_date}</TableBodyCell>
          <!-- <TableBodyCell class="p-4">
            {#if promotion.category === 'overdue'} 
              <P size="xs" class="text-red-600 dark:text-red-400">Overdue</P> 
            {:else if promotion.category === 'soon'}
              <P size="xs" class="text-yellow-600 dark:text-yellow-400">Due Soon</P>
            {:else if promotion.category === 'upcoming'}
              <P size="xs" class="text-gray-500 dark:text-gray-400">Upcoming</P>
            {/if}
          </TableBodyCell> -->
          <TableBodyCell class="p-4">
            {#if promotion.is_eligible} 
              <P size="xs" class="text-green-600 dark:text-green-500">Eligible</P>
            {:else}
              <P size="xs" class="text-red-600 dark:text-red-400">Not Eligible
                <button>
                  <span class="sr-only">Show reason</span>
                  <QuestionCircleSolid size="xs" class="text-gray-400 hover:text-gray-500" />
                </button>
                <Popover placement="bottom-start">
                  <div class="w-72 space-y-1 text-xs font-normal text-gray-500 dark:text-gray-300">
                    <h3 class="font-semibold text-gray-900 dark:text-white">Reason(s)</h3>
                    {#if popoverReasons}
                      {@render popoverReasons()}
                    {/if}
                  </div>
                </Popover>
              </P>
              
              {#snippet popoverReasons()}
              <ul>
                {#if promotion.reasons.unfulfilled_requirements && promotion.reasons.unfulfilled_requirements.length > 0}
                  <P size="xs" class="text-red-500 dark:text-red-400">Unfulfilled Requirements:</P>
                  {#each promotion.reasons.unfulfilled_requirements as unfulfilled_req}
                    <List tag="ul" class="space-y-1 text-gray-500 dark:text-gray-400">
                      <Li icon>
                        <CloseCircleSolid class="me-2 h-3 w-3 text-gray-500 dark:text-gray-400" /> {unfulfilled_req}
                      </Li>
                    </List>
                  {/each}
                  <br/>
                {/if}
                {#if promotion.reasons.missing_documents && promotion.reasons.missing_documents.length > 0}
                  <P size="xs" class="text-red-500 dark:text-red-400">Missing Documents:</P>
                  {#each promotion.reasons.missing_documents as missing_doc}
                    <List tag="ul" class="space-y-1 text-gray-500 dark:text-gray-400">
                      <Li icon>
                        <CloseCircleSolid class="me-2 h-3 w-3 text-gray-500 dark:text-gray-400" /> {reasonFormatter(missing_doc)}
                      </Li>
                    </List>
                  {/each}
                {/if}
              </ul>
              {/snippet}
            {/if}
          </TableBodyCell>
          <TableBodyCell class="space-x-2">
            <Button size="sm" color="alternative" class="gap-2 px-3" onclick={() => ((employees_data = {"id": promotion.id, "name": promotion.name, "ein": promotion.ein}), toggle(promotion.ein), openDocument = true)}>
              <EyeOutline size="sm" /> Details
            </Button>
            <Button size="sm" class="gap-2 px-3" onclick={() => ((employees_data = {
              "id": promotion.id, 
              "name": promotion.name, 
              "ein": promotion.ein, 
              "rank_name": promotion.rank, 
              "group_class_name": promotion.group_class, 
              "rank_id": promotion.rank_id, 
              "is_eligible": promotion.is_eligible,
              }), toggle(promotion.ein), (openPromoted = true))}>
              <AwardOutline size="sm" /> Promoted
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
</main>

{#if openDocument}
  <DocumentPoolDrawer
    bind:open={openDocument}
    data={employees_data}
    documents={legalDocs}
    on:refresh={() => fetchData()}
  />
{/if}

{#if openPromoted}
  <PromotionDrawer 
    bind:open={openPromoted} 
    data={employees_data} 
    documents={legalDocs}
    on:submit={handlePromotedEmployee}
  />
{/if}