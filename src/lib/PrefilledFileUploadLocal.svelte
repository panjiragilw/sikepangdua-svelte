<script lang="ts">
  import { Fileupload, Button } from 'flowbite-svelte';
  import type {SignedURL} from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();


  export let name: string;
  export let prefilledUrls: Record<string, string> = {};

  $: prefilledUrl = prefilledUrls[name];

  $: rawUrl = prefilledUrls[name];

  async function openSignedUrl() {
    if (!rawUrl) return;

    try {
      const res = await fetch(`http://localhost:9091/api/thirdparty/sign-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: rawUrl }),
      });

      const json = await res.json();
      const signedUrl = json?.data as SignedURL;

      if (signedUrl?.signed_url) {
        const cleanUrl = JSON.parse(`"${signedUrl.signed_url}"`);
        window.open(cleanUrl, '_blank');
      } else {
        alert('Failed to fetch signed URL.');
      }
    } catch (e) {
      console.error('Failed fetch signed URL:', e);
      alert('There is an error when opened the file.');
    }
  }

  interface Rule {
    types: string[];
    maxSizeMB: number;
  }

  const rules: Record<string, Rule> = {
    "sk-pns": { types: ['application/pdf'], maxSizeMB: 2 },
    "sk-cpns": { types: ['application/pdf'], maxSizeMB: 2 },
    "skp-1": { types: ['application/pdf'], maxSizeMB: 2 },
    "skp-2": { types: ['application/pdf'], maxSizeMB: 2 },
    "sk-jbtrk": { types: ['application/pdf'], maxSizeMB: 2 },
    "srt-pltkn-jbtrk": { types: ['application/pdf'], maxSizeMB: 2 },
    "sk-kptrk": { types: ['application/pdf'], maxSizeMB: 2 },
    "sk-jbatlng": { types: ['application/pdf'], maxSizeMB: 2 },
  };

  let errors: Record<string, string> = {};
  
  function handleFileChange(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const rule = rules[fieldName];

    // If cancel file selection
    if (!file) {
      errors = { ...errors, [fieldName]: '' };
      return;
    }

    // Validate file type
    if (!rule.types.includes(file.type)) {
      errors = {
        ...errors,
        [fieldName]: `❌ File type must be: ${rule.types.join(', ')}`,
      };
      input.value = ''; // reset file
      return;
    }

    // Validate file size
    const maxSizeBytes = rule.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors = {
        ...errors,
        [fieldName]: `❌ Max. file size ${rule.maxSizeMB} MB`,
      };
      input.value = '';
      return;
    }

     // If passed all validations
    errors = { ...errors, [fieldName]: `✅ ${file.name}` };
    dispatch("fileChange", [file.name]);
  }
  
</script>

{#if errors[name]}
  <!-- <p
    class:text-red-500={errors[name].startsWith('❌')}
    class:text-green-600={errors[name].startsWith('✅')}
    class="text-xs"
  > -->
   <p
    class:text-red-500={errors[name].startsWith('❌')}
    class:text-green-600={errors[name].startsWith('✅')}
    class="text-xs"
  >
    {errors[name]}
  </p>
{/if}
{#if prefilledUrl}
  <div class="flex items-center gap-2 text-sm text-gray-600">
    <span>File already uploaded</span>
    <button
      type="button"
      class="text-xs text-orange-600 hover:text-orange-700 hover:underline bg-transparent border-none p-0 m-0 font-normal"
      onclick={openSignedUrl}
    >
      View document
    </button>
  </div>
{/if}

<Fileupload id={name} name={name} onchange={(e) => handleFileChange(e, name)}/>