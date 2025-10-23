<script lang="ts">
    import { PaginationNav } from 'flowbite-svelte';
    import { createEventDispatcher } from 'svelte';
    // 1. Import types dari file types.ts
    import type { API_Pagination } from './types.ts'; 
    import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";


    // 2. Definisikan Props menggunakan $props()
    type PaginationProps = {
        pagination: API_Pagination;
    };

    let { pagination }: PaginationProps = $props();

    const dispatch = createEventDispatcher();

    // Reactive state to hold the current page number from the props
    let currentPage = $state(pagination.page);

    // Function to handle page change
    function onPageChange(page: number) {
        if (page > 0 && page <= pagination.pages) {
            currentPage = page;
            // Dispatch an event so the parent component can fetch new data
            dispatch('pageChange', { page: currentPage });
        }
    }

    // Handle Next button click
    function onNext() {
        if (pagination.next) {
            onPageChange(currentPage + 1);
        }
    }

    // Handle Previous button click
    function onPrevious() {
        if (pagination.previous) {
            onPageChange(currentPage - 1);
    }
    }
</script>

<div class="flex justify-end mt-4">
    <!-- <PaginationNav 
      currentPage={currentPage}
      totalPages={pagination.pages}
      onnext={onNext}
      onprev={onPrevious}
      onclick={() => onPageChange}
      showIcons
    /> -->

    <PaginationNav 
        currentPage={currentPage} 
        totalPages={pagination.pages} 
        onPageChange={onPageChange}>
        {#snippet prevContent()}
            <span class="sr-only">Previous</span>
            <ArrowLeftOutline class="h-5 w-5" />
        {/snippet}
        {#snippet nextContent()}
            <span class="sr-only">Next</span>
            <ArrowRightOutline class="h-5 w-5" />
        {/snippet}
    </PaginationNav>
</div>