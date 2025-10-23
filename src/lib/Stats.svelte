<script lang="ts">
  import { Avatar, Card, Heading, P, Popover, TabItem, Tabs, List, Li } from 'flowbite-svelte';
  import { Change, More, DateRangeSelector } from '$lib';
  import { imagesPath } from './variables';
  import { QuestionCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
  import type { StatsProps } from './types';

  let { eligible, notEligible, title, popoverTitle, popoverDesc, tab1Title, tab2Title }: StatsProps = $props();

  function reasonFormatter(reason: string) {
    return reason.replace("Missing required document: ", "");
  }
</script>

<Card size="xl" class="p-4 sm:p-6">
  <div class="mb-4 flex items-center gap-2">
    <Heading tag="h3" class="w-fit text-lg font-semibold dark:text-white">
      {title}
    </Heading>
    <!-- <button>
      <span class="sr-only">Show information</span>
      <QuestionCircleSolid size="sm" class="text-gray-400 hover:text-gray-500" />
    </button>
    <Popover placement="bottom-start">
      <div class="w-72 space-y-2 text-sm font-normal text-gray-500 dark:text-gray-300">
        <h3 class="font-semibold text-gray-900 dark:text-white">{popoverTitle}</h3>
        {#if popoverDesc}
          {@render popoverDesc()}
        {/if}
      </div>
    </Popover> -->
  </div>
    
  <Tabs style="full" class="flex divide-x divide-gray-200 shadow rtl:divide-x-reverse dark:divide-gray-700" classes={{ content: 'p-3 mt-4 min-h-[24rem]' }}>
    <TabItem class="w-full">
      {#snippet titleSlot()}
        {tab1Title}
      {/snippet}
      <ul class="-m-3 divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-sm font-medium text-gray-900 dark:text-white"></div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Expected promotion date</div>
        </div>
        {#each eligible as { name, expected_promotion_date }}
          <li class="py-3 sm:py-4">
            <div class="flex items-center justify-between">
              <div class="flex min-w-0 items-center">
                <!-- <img class="h-10 w-10 flex-shrink-0" src={src ? imagesPath(src, 'products') : ''} alt={image} /> -->
                <div class="ml-3">
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {name}
                  </p>
                  <!-- <Change value={change} size="sm" equalHeight class="ml-px" /> -->
                  <!-- {#if reasons && reasons.length > 0} 
                  <P size="xs" class="text-primary-700 dark:text-primary-500">Not Eligible
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
                  {#each reasons as reason}
                    <P size="xs">- {reason}</P>
                  {/each}
                  {/snippet}
                  {:else}
                  <P size="xs" class="text-green-700 dark:text-green-500">Eligible</P>
                  {/if} -->
                </div>
              </div>
              <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                {expected_promotion_date}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </TabItem>
    <TabItem class="w-full" open>
      {#snippet titleSlot()}
        {tab2Title}
      {/snippet}
      <ul class="-m-3 divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-sm font-medium text-gray-900 dark:text-white"></div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Expected promotion date</div>
        </div>
        {#each notEligible as { name, is_eligible, reasons, expected_promotion_date }}
          <li class="py-3 sm:py-3.5">
            <div class="flex items-center justify-between">
              <div class="flex min-w-0 items-center">
                <!-- <Avatar src={avatar ? imagesPath(avatar, 'users') : ''} /> -->
                <div class="ml-3">
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {name}
                  </p>
                  <!-- <span class="text-gray-500">{email}</span> -->
                  {#if !is_eligible} 
                    <P size="xs" class="text-primary-700 dark:text-primary-500">Not Eligible
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
                        <!-- {#if reason.unfulfilled_requirements.length > 0} -->
                          {#each reasons.unfulfilled_requirements as unfulfilled_req}
                            <List tag="ul" class="space-y-1 text-gray-500 dark:text-gray-400">
                              <Li icon>
                                <CloseCircleSolid class="me-2 h-3 w-3 text-gray-500 dark:text-gray-400" /> {unfulfilled_req}
                              </Li>
                            </List>
                          {/each}
                        <!-- {/if} -->

                        <!-- {#if reason.missing_documents.length > 0} -->
                          {#each reasons.missing_documents as missing_doc}
                            <List tag="ul" class="space-y-1 text-gray-500 dark:text-gray-400">
                              <Li icon>
                                <CloseCircleSolid class="me-2 h-3 w-3 text-gray-500 dark:text-gray-400" /> {reasonFormatter(missing_doc)}
                              </Li>
                            </List>
                          {/each}
                        <!-- {/if} -->
                      </ul>
                    {/snippet}
                  {/if}
                </div>
              </div>
              <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                {expected_promotion_date}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </TabItem>
  </Tabs>

  <div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 sm:pt-6 dark:border-gray-700">
    <!-- <DateRangeSelector /> -->
    <More title="Show All" href="/promotions/regular" />
  </div>
</Card>

<!--
@component
[Go to docs](https://flowbite-svelte-admin-dashboard.vercel.app/)
## Type
[StatsProps](https://github.com/themesberg/flowbite-svelte-admin-dashboard/blob/main/src/lib/types.ts#L101)
## Props
@prop products
@prop customers
@prop title
@prop popoverTitle
@prop popoverDesc
@prop tab1Title
@prop tab2Title
-->
