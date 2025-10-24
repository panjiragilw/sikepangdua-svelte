<script lang="ts">
  import type { LinkType } from 'flowbite-svelte';
  import Frame from './Frame.svelte';
  import { DiscordSolid, DribbbleSolid, FacebookSolid, GithubSolid, TwitterSolid } from 'flowbite-svelte-icons';
  import type { Component } from 'svelte';

  const links: LinkType[] = [
    
  ];

  const brands: [Component, string][] = [
    
  ];
</script>

{#if (links.length > 0 && brands.length > 0)}
<Frame tag="footer" rounded shadow class="mx-4 my-2 rounded-lg bg-white p-4 shadow md:flex md:items-center md:justify-between md:p-6 xl:p-8 dark:bg-gray-800">
  <ul class="mb-6 flex flex-wrap items-center space-y-1 sm:gap-4 md:mb-0 xl:gap-6">
    {#each links as { name, href }}
      <li>
        <a {href} class="mr-4 text-sm font-normal text-gray-500 hover:underline sm:mr-6 dark:text-gray-300">
          {name}
        </a>
      </li>
    {/each}
  </ul>
  <div class="flex space-x-6 sm:justify-center">
    {#each brands as [component, href]}
      <a {href} class="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
        <svelte:component this={component} size="md" />
      </a>
    {/each}
  </div>
</Frame>
{/if}

<p class="my-10 text-center text-sm text-gray-500">
  © 2019-2023 <a href="https://flowbite.com/" class="hover:underline" target="_blank"> Flowbite.com </a>. All rights reserved.
</p>
