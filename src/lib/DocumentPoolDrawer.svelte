<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { Button, Heading, Input, Label, Select, Drawer, Hr} from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import type { DocumentPoolDrawerProps, PerformanceDetail } from './types';
  import type { Attachment } from 'svelte/attachments';
  import PrefilledFileUploadLocal from './PrefilledFileUploadLocal.svelte';
    import { json } from '@sveltejs/kit';

  const dispatch = createEventDispatcher<{ refresh: void, close: void }>();

  let { open = $bindable(false), title = 'Document Pool', data = {}, documents = [], prefilledUrls = $bindable({}), additionalFields = [], ...formAttrs }: DocumentPoolDrawerProps = $props();
  let performanceDetails = $state<PerformanceDetail[] | undefined>(undefined);
  let error = $state<string | null>(null);

  interface SKPItem {
    id: number;
    docId: number;
    name: string;
    label: string;
    isDisabled: boolean; 
    ratingValue: string; 
    docTypeId: number;
    docUrl: string;
    startDate: string;
    endDate: string;
  }

  const currentYear = new Date().getFullYear();
  const datesLastYear = getYearDates(currentYear - 1); // e.g., 2024
  const datesLast2Year = getYearDates(currentYear - 2); // e.g., 2024

  const skpData = $state<SKPItem[]>([
    {
        id: 0,
        docId: 0,
        name: 'skp-1',
        label: 'SKP Tahun 1',
        isDisabled: true, // Default: Disabled
        ratingValue: '',
        docTypeId: 4,
        docUrl: '',
        startDate: datesLastYear.startDate,
        endDate: datesLastYear.endDate,
    },
    {
        id: 0,
        docId: 0,
        name: 'skp-2',
        label: 'SKP Tahun 2',
        isDisabled: true, // Default: Disabled
        ratingValue: '',
        docTypeId: 5,
        docUrl: '',
        startDate: datesLast2Year.startDate,
        endDate: datesLast2Year.endDate,
    },
  ]);

  type ApiPerformanceDetailListResponseSuccess = { status: number; data: PerformanceDetail[] };
  type ApiListResponseError = { status: number; error: string; logMsg: string };

  function getYearDates(year: number): { startDate: string, endDate: string } {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    return { startDate, endDate };
  }

  const prefill: Attachment<HTMLFormElement> = (form) => {
    // console.log("form: ", form)
    const fill = (vals: Record<string, unknown> = {}) => {
      // console.log("vals: ", vals)
      // console.log("skpData prefill: ", skpData);
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

        switch (key) {
          case "skp-1":
            if (value && String(value) != "") {
              // skpData[0].docId = 
              skpData[0].docUrl = String(value);
              skpData[0].isDisabled = false;
            }
            break;
          case "skp-2":
            // console.log("valskp-2: ", value)
            if (value && String(value) != "") {
              skpData[1].docUrl = String(value);
              skpData[1].isDisabled = false;
            }
            break;
        }

        // Handle different input types
        if (el instanceof HTMLInputElement) {
          if (el.type === 'file') {
            continue;
          } else if (el.type === 'checkbox') {
            el.checked = Boolean(value);
          } else {
            el.value = String(value);
          }
        } else if (el instanceof HTMLTextAreaElement) {
          el.value = String(value);
        } else if (el instanceof HTMLSelectElement) {
          el.value = String(value);
        } else {
          // For custom components like Flowbite Select, try setting the value property
          try {
            (el as any).value = String(value);
          } catch (e) {
            console.warn(`Could not set value for element ${key}:`, e);
          }
        }

        // if (key == "rating-skp-1"){
          
        // }
      }
    };

    const docFormatter: Record<string, string> = {
      "skp1st": "skp-1",
      "skp2nd": "skp-2",
      "skcpns": "sk-cpns",
      "skpnsp": "sk-pns",
      "plntkr": "srt-pltkn-jbtrk",
      "skjbtr": "sk-jbtrk",
      "skjbal": "sk-jbatlng",
      "skkptr": "sk-kptrk"
    }; 
   
    function getNestedValue<T = unknown>(
      obj: Record<string, unknown>,
      path: string
    ): T | undefined {
      return path.split('.').reduce<unknown>((acc, key) => {
        if (typeof acc === 'object' && acc !== null && key in acc) {
          return (acc as Record<string, unknown>)[key];
        }
        return undefined;
      }, obj) as T | undefined;
    }
    
    function transformDocsToPrefillObject(
      docs: Record<string, unknown>[] = [],
      codePath = 'document_type.code',
      valuePath = 'url'
    ): Record<string, string> {
      const result: Record<string, string> = {};
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          // console.log("doc: ", doc);
          const raw = getNestedValue(doc, codePath);
          const rawCode: string = typeof raw === 'string' ? raw.toLowerCase() : '';
          const formatted = docFormatter[rawCode];
          const value = getNestedValue(doc, valuePath);
          if (formatted && typeof value === 'string') {
            result[formatted] = value;
          }

          // console.log("docTypeID: ", getNestedValue(doc, "document_type.id"))
          if ([4, 5].includes(Number(getNestedValue(doc, "document_type.id")))) {
            switch (Number(getNestedValue(doc, "document_type.id"))){
              case 4:
                skpData[0].docId = Number(doc.id)
              case 5:
                skpData[0].docId = Number(doc.id)
            }
          }
          
        }
      }
      return result;
    }

    setTimeout(() => {
      fill(data);
      const docValues = transformDocsToPrefillObject(documents);
      fill(docValues);
      prefilledUrls = docValues;
      // const skpVals = transformPerformanceDetailToPrefillObject(performanceDetails)
      // fill(skpVals);
    }, 50);

    return () => {
      // Cleanup function (optional)
    };
  };

  let isEdited = false;

  function documentTypeFormatter(docCode: string) {
    const docFormatter: Record<string, number> = {
      "skp-1": 4,
      "skp-2": 5,
      "srt-pltkn-jbtrk": 8,
      "sk-cpns": 11,
      "sk-pns": 12,
      "sk-jbtrk": 14,
      "sk-jbatlng": 16,
      "sk-kptrk": 17
    }; 

    if (docCode in docFormatter) {
      return docFormatter[docCode];
    } else {
      return 0; // default value if not found
    }
  }

  function fetchExistingDocumentID(docCode: string, documents: Record<string, unknown>[]) {
     const revertDocFormatter: Record<string, string> = {
      "skp-1": "skp1st",
      "skp-2": "skp2nd",
      "srt-pltkn-jbtrk": "plntkr",
      "sk-cpns": "skcpns",
      "sk-pns": "skpnsp",
      "sk-jbtrk": "skjbtr",
      "sk-jbatlng": "skjbal",
      "sk-kptrk": "skkptr"
    };

    const targetCode = revertDocFormatter[docCode];
    for (const doc of documents) {
      const code = (doc.document_type as Record<string, unknown>)?.code;
      if (code && typeof code === 'string' && code.toLowerCase() === targetCode) {
        return doc.id; // Return the document ID if found
      }
    }
  }

  let uploading = $state(false);

  async function insertUpdatePerformanceDetail(
    docKey: string,
    employeeId: number,
  ){
    let performanceDetailId: number = 0;
    const jsonPayload: Record<string, unknown> = {};

    console.log("skp insert data: ", skpData);
    switch (docKey) {
      case "rating-skp-1":
        performanceDetailId = skpData[0].id;
        jsonPayload["document_id"] = skpData[0].docId
        jsonPayload["performance_rating"] = skpData[0].ratingValue
        jsonPayload["start_date"] = skpData[0].startDate
        jsonPayload["end_date"] = skpData[0].endDate
        jsonPayload["employee_id"] = employeeId
        break;

      case "rating-skp-2":
        performanceDetailId = skpData[1].id;
        jsonPayload["document_id"] = skpData[1].docId
        jsonPayload["performance_rating"] = skpData[1].ratingValue
        jsonPayload["document_type_id"] = skpData[1].docTypeId
        jsonPayload["start_date"] = skpData[1].startDate
        jsonPayload["end_date"] = skpData[1].endDate
        jsonPayload["employee_id"] = employeeId
        break;
    }

    // console.log("jsonPayload: ", jsonPayload, performanceDetailId);
    if (json.length > 1) {
      if (performanceDetailId > 0) {
        //  console.log("update pd: ", jsonPayload);
        // update performance detail
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employee/detail/performance/${performanceDetailId}`, {
          method: 'PUT',
          body: JSON.stringify(jsonPayload), 
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.error(`Failed when update performance detail for ${docKey}. Status: ${res.status}`);
        } 
      } else {
        // insert performance detail
        // console.log("insert pd: ", jsonPayload);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employee/detail/performance`, {
          method: 'POST',
          body: JSON.stringify(jsonPayload), 
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          console.error(`Failed when insert performance detail for ${docKey}. Status: ${res.status}`);
        } 
      }
    }

  
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    uploading = true;
    
    const form = e.currentTarget as HTMLFormElement;
    const initialFormData = new FormData(form);
    const formEntryData = Object.fromEntries(initialFormData.entries());

    const existingDocKeys = Object.keys(prefilledUrls);
    
    const employeeId = data.id as string; 
    let allSuccess = true;

    for (const [key, value] of Object.entries(formEntryData)) {
      if (value instanceof File && key !== 'ein' && key !== 'name') {
        if (value.name === "" || value.size < 1) {
          continue;
        }

        const uploadFormData = new FormData();
        
        uploadFormData.append('employee_id', employeeId);
        uploadFormData.append('document_type_id', documentTypeFormatter(key).toString());
        uploadFormData.append('document_file', value);

        try {
          const isExistingDoc = existingDocKeys.includes(key);
          // console.log("exist: ", key, isExistingDoc)

          const apiBase = import.meta.env.VITE_API_BASE_URL || '';
          console.log(apiBase);
          if (isExistingDoc) {
            // console.log(`update for: ${key} `, isExistingDoc)
            const res = await fetch(`${apiBase}/api/employee/document/${fetchExistingDocumentID(key, documents)}`, {
              method: 'PUT',
              body: uploadFormData, 
            });
            console.log(res);

            const contentType = res.headers.get('content-type') ?? '';
            const text = await res.text();

            if (!res.ok || !contentType.includes('application/json')) {
              allSuccess = false; 
              console.error(`Upload failed for document ${key}. Status: ${res.status}`);
              throw new Error(`Invalid response: ${res.status} — ${text.slice(0, 100)}`);
            } 

            const json = JSON.parse(text);
            if (json.status !== 200) {
              const errJson = json;
              throw new Error(errJson);
            }
            
            if (["skp-1", "skp-2"].includes(key)) {
              console.log("process skp: ", key, skpData)
              if ((key === "skp-1" && skpData[0].docId > 0) || (key === "skp-2" && skpData[1].docId > 0)) {
                insertUpdatePerformanceDetail(key, Number(employeeId))
              }
            }
            
          } else {
            // console.log(`insert for: ${key} `, isExistingDoc)
            const res = await fetch(`${apiBase}/api/employee/document`, {
              method: 'POST',
              body: uploadFormData, 
            });
            console.log(res);
            
            const contentType = res.headers.get('content-type') ?? '';
            const text = await res.text();

            if (!res.ok || !contentType.includes('application/json')) {
              allSuccess = false; 
              console.error(`Upload failed for document ${key}. Status: ${res.status}`);
              throw new Error(`Invalid response: ${res.status} — ${text.slice(0, 100)}`);
            } 
            
            const json = JSON.parse(text);
            if (json.status !== 200) {
              const errJson = json;
              throw new Error(errJson);
            }

            if (["skp-1", "skp-2"].includes(key)) {
              // const json = await res.json();
              const docId = json.data.last_inserted_id as number;

              // console.log("docID: ", docId.last_inserted_id);

                switch (key) {
                case "skp-1":
                  skpData[0].docId = docId;
                case "skp-2":
                  skpData[1].docId = docId;
              }
              // console.log("process skp: ", key, skpData)
              if ((key === "skp-1" && skpData[0].docId > 0) || (key === "skp-2" && skpData[1].docId > 0)) {
                insertUpdatePerformanceDetail(key, Number(employeeId))
              }
            }
          }
        } catch (error) {
          allSuccess = false;
          console.error(`Network error during upload for ${key}:`, error);
          // break;
        }
      } else {
        // console.log("key: ", key)
        if (["rating-skp-1", "rating-skp-2"].includes(key)) {
          if ((key === "rating-skp-1" && skpData[0].docId > 0) || (key === "rating-skp-2" && skpData[1].docId > 0)) {
            insertUpdatePerformanceDetail(key, Number(employeeId))
          }
        }
      }

      
    }
    
    uploading = false;
    
    if (allSuccess) {
      dispatch('refresh'); 
      
      open = false; 
      
      alert('All files were uploaded successfully!');
    } else {
      alert('Failed to upload some or all files.');
    }

    isEdited = false;
  }

  function handleFileChange(skpItem: SKPItem, event: CustomEvent<string[]>) {
    // console.log("handle file change: ", event.detail);
    const urls = event.detail;
    const hasFile = urls && urls.length > 0;
    
    skpItem.isDisabled = !hasFile; 
    
    if (!hasFile) {
      skpItem.ratingValue = '';
    }
  }

  async function fetchPerformanceDetail(
    // employeeId?: number,
  ): Promise<void> {
    const employeeId = data.id as number; 

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      console.log(apiBase);  

      let apiURL = `${apiBase}/api/employee/detail/performance/list`;
      let urlQuery: string = ""

      if (employeeId && employeeId > 0) {
        urlQuery += `employee_id=${employeeId}`;
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

      const json = JSON.parse(text) as ApiPerformanceDetailListResponseSuccess | ApiListResponseError;
      if (json.status !== 200) {
        const errJson = json as ApiListResponseError;
        throw new Error(errJson.error);
      }
      const successResponse = json as ApiPerformanceDetailListResponseSuccess;
      performanceDetails = successResponse.data;

      // console.log("performanceDetails: ", performanceDetails)
      if (performanceDetails && performanceDetails.length > 0) {
          skpData.forEach(skpItem => {
              const foundDetail = performanceDetails?.find(
                  // Cocokkan berdasarkan ID Tipe Dokumen
                  detail => detail.document_type_id === skpItem.docTypeId 
              );

              if (foundDetail) {
                  skpItem.id = foundDetail.id;
                  skpItem.docId = foundDetail.document_id; // Tambahkan ini jika perlu ID dokumen
                  skpItem.ratingValue = foundDetail.performance_rating;
                  skpItem.isDisabled = false; 
                  skpItem.startDate = foundDetail.start_date;
                  skpItem.endDate = foundDetail.end_date;
              } 
          });
      } 
    } catch (e: any) {
      error = e.message;
    } finally {
      // console.log("performanceDetails: ", performanceDetails);
      // console.log("sleected Id: ", selectedRankId);
    }
  }

  onMount(fetchPerformanceDetail);

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
        <span>Name</span>
        <Input name="name" class="border font-normal outline-none" placeholder="Type product name" required readonly />
      </Label>

      <Label class="space-y-2">
        <span>EIN</span>
        <Input name="ein" class="border font-normal outline-none" placeholder="Type EIN" required readonly />
      </Label>
      <Hr/>
      {#each skpData as item}
        <div class="space-y-1">
          <Label for={item.name}>{item.label}</Label>
          <PrefilledFileUploadLocal 
              name={item.name} 
              bind:prefilledUrls 
              on:fileChange={(e) => handleFileChange(item, e)} 
          />
        </div>

        <div>
          <Label class="space-y-2 text-xs" for={`rating-${item.name}`}>
              <span>Performance Rating in {item.label}</span>
              <Select 
                name="rating-{item.name}" 
                placeholder="Choose Rating"
                size="sm"
                bind:value={item.ratingValue}
                disabled={item.isDisabled} 
            >
                <option value="very_poor">Very Poor</option>
                <option value="poor">Poor</option>
                <option value="need_improve">Need Improvement</option>
                <option value="good">Good</option>
                <option value="very_good">Very Good</option>
              </Select>

               <Input 
                type="hidden" 
                name="{item.name}-doc-id" 
                value={item.docId}
            />
          </Label>
        </div>
      {/each}
      <Hr/>
      {#each [
        ['sk-pns', 'SK PNS'],
        ['sk-cpns', 'SK CPNS'],
        ['sk-jbtrk', 'SK Jabatan (terakhir)'],
        ['srt-pltkn-jbtrk', 'Surat Pelantikan (dalam jabatan terakhir)'],
        ['sk-kptrk', 'SK KP terakhir'],
        ['sk-jbatlng', 'SK Jabatan (atasan langsung)']
      ] as [name, label]}
        <div class="space-y-1">
          <Label for={name}>{label}</Label>
          <PrefilledFileUploadLocal name={name} bind:prefilledUrls />
        </div>
      {/each}
    </div>

    <div class="sticky bottom-0 left-0 px-4 py-4 border-t z-10 bg-white dark:bg-gray-800">
      {#if uploading}
       <div class="px-4 py-2 text-sm text-gray-500 italic text-center">
         Uploading documents, please wait...
       </div>
      {/if}
      <div class="flex justify-center space-x-4">
        <Button type="submit" class="w-full">Save</Button>
        <Button color="alternative" class="w-full" onclick={() => {(open = false)}}>
          <CloseOutline />
          Cancel
        </Button>
      </div>
    </div>
  </form>
</Drawer>