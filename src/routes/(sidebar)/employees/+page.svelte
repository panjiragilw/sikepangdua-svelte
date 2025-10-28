<script lang="ts">
  import { onMount } from "svelte";
  import { Avatar, Breadcrumb, BreadcrumbItem, Button, Checkbox, Heading, Indicator } from 'flowbite-svelte';
  import { Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead } from 'flowbite-svelte';
  import { TableHeadCell, Toolbar, ToolbarButton } from 'flowbite-svelte';
  import { CogSolid, DotsVerticalOutline, DownloadSolid } from 'flowbite-svelte-icons';
  import { EditOutline, ExclamationCircleSolid, PlusOutline, TrashBinSolid } from 'flowbite-svelte-icons';
  // import Users from '../../../data/users.json';
  import { imagesPath, DeleteModal, UserModal } from '$lib';
  import MetaTag from '../../utils/MetaTag.svelte';
  import type {API_Pagination, Employee} from '$lib/types'
  import EmployeeModal from "$lib/EmployeeModal.svelte";
  import PaginationComponent from "$lib/Pagination.svelte";
    import { getApiBaseUrl } from "$lib/api";
    // import type { page } from "$app/state";

  let openEmployee: boolean = $state(false); // modal control
  let openDelete: boolean = $state(false); // modal control

  let tableLoading = $state(false);

  let current_employee: any = $state({});
  const path: string = '/employees';
  const description: string = 'Employee Management Page';
  const title: string = 'Employee';
  const subtitle: string = 'CRUD Employees';

  export const dark = $state(false);

  type Sort = { sort_by: string; order_by: "asc" | "desc" };
  type Meta = { pagination: API_Pagination; sort: Sort };
  type ApiEmployeeListResponseSuccess = { status: number; data: Employee[]; meta: Meta };
  type ApiEmployeeListResponseError = { status: number; error: string; logMsg: string };

  let employees = $state<Employee[] | undefined>(undefined);
  let meta = $state<Meta | undefined>(undefined);
  let loading = $state(false);
  let error = $state<string | null>(null);
  // State baru untuk query pencarian dari input
  let searchQuery = $state('');

  // Tambahkan interface untuk tipe parameter
  interface FetchParams {
      page?: number;
      pageSize?: number;
      name?: string;
  }

  async function fetchEmployeeList(
    req: FetchParams
  ): Promise<void> {
    try {
      const apiBase = getApiBaseUrl();
      console.log(apiBase); 

      let apiURL = `${apiBase}/api/employee/list`;
      let urlQuery: string = ""

      let page = req.page ?? 1
      let limit = req.pageSize ?? 10

      if (req.name && req.name != "") {
        urlQuery += `&name=${req.name}`;
        page = 0
        limit = 0
      }
      if (page > 0){
        urlQuery += `&page=${page}`;
      }
      if (limit > 0) {
        urlQuery += `&limit=${limit}`;
      }

      if (urlQuery != "") {
        apiURL += `?${urlQuery}`
      }
    
      const res = await fetch(apiURL);
      console.log(res);

      
      const contentType = res.headers.get('content-type') ?? '';
      const text = await res.text();

      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`Invalid response: ${res.status} — ${text.slice(0, 100)}`);
      }

      const json = JSON.parse(text) as ApiEmployeeListResponseSuccess | ApiEmployeeListResponseError;
      if (json.status !== 200) {
        const errJson = json as ApiEmployeeListResponseError;
        throw new Error(errJson.error);
      }
      const successResponse = json as ApiEmployeeListResponseSuccess;
      employees = successResponse.data;
      meta = successResponse.meta;      
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  export const employeeList = $state<Array<Employee>>([]);

  async function fetchData(
    req: FetchParams = {}
  ) {
    // console.log("fetching data page: ", page);
    // console.log("fetching with req: ", req)
    tableLoading = true;
    // await fetchPromotionList();
    // Gunakan Promise.all untuk menunggu fetch dan delay minimal
    try {
        const [_, successResponse] = await Promise.all([
            new Promise(resolve => setTimeout(resolve, 300)), // Delay visual
            fetchEmployeeList(req) // Ini akan mengembalikan successResponse.data dan meta
        ]);

        employeeList.splice(0, employeeList.length, ...(employees ?? []));
    } catch (e) {
        // Log error jika ada masalah di salah satu promise
        console.error("Error during data fetching and delay:", e);
    } finally {
        tableLoading = false; // ✅ NONAKTIFKAN LOADING setelah semua proses selesai
    }
  }

  // Event handler for the Pagination component
  function handlePageChange(event: CustomEvent<{ page: number }>) {
    // console.log("page changed: ", event.detail.page)
    const param = 
    fetchData({
      page: event.detail.page
    });
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
      fetchData({
        name: query
      });
      // console.log(`[API CALL] Searching for: ${query}`);
    }
  }, 1000); // 1000ms (1 detik) delay

  // Svelte Runes: Effect untuk memantau perubahan searchQuery
  $effect(() => {
      // Hanya panggil debounce jika query telah berubah
      debouncedFetchEmployees(searchQuery);
  });

  async function handleAddEmployee(e: CustomEvent) {
    e.preventDefault();
    const payload = e.detail; // Ini adalah payload dari modal
    // console.log("Receive event ADD with payload:", payload);

    const allowedKeysStr = [
      "name", 
      "ein", 
      "position", 
      "position_type", 
      "sds_last_group", 
      "employee_type", 
      "parent_agency"
    ];
    const allowedKeysNumber = [
      "work_unit_id",
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

    // console.log("ADD with:", jsonPayload);

    // Hit API add employee
    try {
      const apiBase = getApiBaseUrl();
      console.log(apiBase);

      const jsonPayloadStr = JSON.stringify(jsonPayload);
      const res = await fetch(`${apiBase}/api/employee/`, {
        method: 'POST',
        body: jsonPayloadStr, 
        headers: {
            'Content-Type': 'application/json',
        },
      });

      // Cek status HTTP. Di sini diasumsikan status 2xx adalah sukses
      if (!res.ok) {
        console.error(`Add failed. Status: ${res.status}`, jsonPayload);
        throw new Error(`Invalid response: ${res.status}`);
      } 
      // Tutup modal setelah sukses
      openEmployee = false;
      // Muat ulang data tabel
      searchQuery = "";
      fetchData(); 
    } catch (e) {
      console.error("Failed to add:", e);
    }
  }

  async function handleSaveEmployee(e: CustomEvent) {
    e.preventDefault();
    const payload = e.detail; // Ini adalah payload dari modal
    // console.log("Receive event SAVE (EDIT) with payload:", payload);
    
    const allowedKeysStr = [
      "name", 
      "ein", 
      "position", 
      "position_type", 
      "sds_last_group", 
      "employee_type", 
      "parent_agency"
    ];
    const allowedKeysNumber = [
      "work_unit_id",
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

    // console.log("SAVE (EDIT) with:", jsonPayload);

    // Hit API add employee
    try {
      const apiBase = getApiBaseUrl();
      console.log(apiBase);

      const jsonPayloadStr = JSON.stringify(jsonPayload);
      const res = await fetch(`${apiBase}/api/employee/${payload.id}`, {
        method: 'PUT',
        body: jsonPayloadStr, 
        headers: {
            'Content-Type': 'application/json',
        },
      });

      // Cek status HTTP. Di sini diasumsikan status 2xx adalah sukses
      if (!res.ok) {
        console.error(`Edit failed. Status: ${res.status}`, jsonPayload);
        throw new Error(`Invalid response: ${res.status}`);
      } 
      // Tutup modal setelah sukses
      openEmployee = false;
      // Muat ulang data tabel
      searchQuery = "";
      fetchData(); 
    } catch (e) {
      console.error("Failed to edit:", e);
    }
  }

  async function handleDeleteEmployee(e: CustomEvent) {
    e.preventDefault();
    // console.log(e.detail);

    const apiBase = getApiBaseUrl();
    console.log(apiBase);
    if (e.detail === true) {
      console.log("id: ", current_employee.id);
      try {
        const res = await fetch(`${apiBase}/api/employee/${current_employee.id}`, {
          method: 'DELETE',
        });

        // Cek status HTTP. Di sini diasumsikan status 2xx adalah sukses
        if (!res.ok) {
          console.error(`Delete failed. Status: ${res.status}`);
          throw new Error(`Invalid response: ${res.status}`);
        } 
        // Tutup modal setelah sukses
        openEmployee = false;
        // Muat ulang data tabel
        searchQuery = "";
        fetchData(); 
      } catch (e) {
        console.error("Failed to delete:", e);
      }
    }
  }

  onMount(fetchData);
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
  <h1 class="hidden">Employees</h1>
  <div class="p-4">
    <Breadcrumb class="mb-5">
      <BreadcrumbItem home>Home</BreadcrumbItem>
      <BreadcrumbItem>Employees</BreadcrumbItem>
    </Breadcrumb>
    <Heading tag="h1" class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">All employees</Heading>

    <Toolbar embedded class="w-full py-4 text-gray-500  dark:text-gray-300">
      <Input 
        placeholder="Search for employees" 
        class="me-4 w-80 border xl:w-96" 
        bind:value={searchQuery}
      />
      <div class="border-l border-gray-100 pl-2 dark:border-gray-700">
        <!-- <ToolbarButton color="dark" class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700">
          <CogSolid size="lg" />
        </ToolbarButton>
        <ToolbarButton color="dark" class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700">
          <TrashBinSolid size="lg" />
        </ToolbarButton>
        <ToolbarButton color="dark" class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700">
          <ExclamationCircleSolid size="lg" />
        </ToolbarButton>
        <ToolbarButton color="dark" class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700">
          <DotsVerticalOutline size="lg" />
        </ToolbarButton> -->
      </div>
      {#snippet end()}
        <div class="flex items-center space-x-2">
          <Button size="sm" class="gap-2 px-3 whitespace-nowrap" onclick={() => ((current_employee = {}), (openEmployee = true))}>
            <PlusOutline size="sm" />Add
          </Button>
          <!-- <Button size="sm" color="alternative" class="gap-2 px-3">
            <DownloadSolid size="md" class="-ml-1" />Export
          </Button> -->
        </div>
      {/snippet}
    </Toolbar>
  </div>
  <Table>
    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
      <TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
      {#each ['Name', 'Position', 'Rank', 'Group/Class', 'Unit', 'Actions'] as title}
        <TableHeadCell class="p-4 font-medium">{title}</TableHeadCell>
      {/each}
    </TableHead>
    <TableBody>
      {#each employees as employee}
        <TableBodyRow class="text-base">
          <TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
          <TableBodyCell class="w-60 mr-12 flex items-center space-x-6 p-4 whitespace-nowrap">
            <Avatar src={imagesPath('', 'users')} />
            <div class="text-sm font-normal text-gray-500 dark:text-gray-300">
              <div class="text-base font-semibold text-gray-900 dark:text-white w-60 max-w-xs whitespace-normal break-words">{employee.name}</div>
              <div class="text-sm font-normal text-gray-500 dark:text-gray-300">{employee.ein}</div>
            </div>
          </TableBodyCell>
          <TableBodyCell class="w-60 max-w-xs whitespace-normal break-words">
            {employee.position}
          </TableBodyCell>
          <TableBodyCell class="p-4 w-50 max-w-xs whitespace-normal break-words">{employee.rank}</TableBodyCell>
          <TableBodyCell class="p-4">{employee.group_class}</TableBodyCell>
          <TableBodyCell class="p-4 w-32 max-w-xs whitespace-normal break-words">{employee.work_unit}</TableBodyCell>
          <!-- <TableBodyCell class="p-4 font-normal">
            <div class="flex items-cent/er gap-2">
               <Indicator color={employee.work_unit === 'Active' ? 'green' : 'red'} /> 
              {employee.work_unit}
            </div>
          </TableBodyCell> -->
          <TableBodyCell class="space-x-2 p-4">
            <Button size="sm" class="gap-2 px-3" onclick={() => ((current_employee = employee), (openEmployee = true))}>
              <EditOutline size="sm" /> Edit
            </Button>
            <Button color="red" size="sm" class="gap-2 px-3" onclick={() => ((current_employee = employee), (openDelete = true))}>
              <TrashBinSolid size="sm" /> Delete
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  {#if meta?.pagination}
  <PaginationComponent 
    pagination={meta.pagination} 
    on:pageChange={handlePageChange} 
  />
  {/if}
</main>

<!-- Modals -->

<EmployeeModal 
  bind:open={openEmployee} 
  data={current_employee} 
  on:addEmployee={handleAddEmployee}
  on:saveEmployee={handleSaveEmployee}
/>
<DeleteModal bind:open={openDelete} on:confirm={handleDeleteEmployee}/>
