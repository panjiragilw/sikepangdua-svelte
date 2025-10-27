<script lang="ts">
  import { onMount } from "svelte";
  import trafficOptions from '../graphs/traffic';
  import { DesktopPcOutline, MobilePhoneOutline } from 'flowbite-svelte-icons';
  import { Chart } from '@flowbite-svelte-plugins/chart';
  import { ChartWidget, Stats, Traffic, getChartOptions, hostPort } from '$lib';
  import type { DeviceOption, API_Pagination, RegularPromotionCheckResult, TrafficData, PromotionWithCategory } from '$lib/types';

  type Sort = { sort_by: string; order_by: "asc" | "desc" };
  type Meta = { pagination: API_Pagination; sort: Sort };
  type ApiResponseSuccess = { status: number; data: RegularPromotionCheckResult; meta: Meta };
  type ApiResponseError = { status: number; error: string; logMsg: string };

  let promotions = $state<RegularPromotionCheckResult | undefined>(undefined);
  let meta = $state<Meta | undefined>(undefined);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Fetch programs – accepts an optional new page or new page size.
  async function fetchPromotionList(
    newPage?: number
    // newPageSize?: number
  ): Promise<void> {
    // if (newPage !== undefined) currentPage = newPage;
    // if (newPageSize !== undefined) pageSize = newPageSize;
    // loading = true;
    // error = null;
    const apiURL = `${location.origin}/api/employee/check-promotion/regular/list`;
    try {
      const res = await fetch(apiURL);
      // if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const contentType = res.headers.get('content-type') ?? '';
      if (!res.ok || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("Unexpected response:", text.slice(0, 100));
        throw new Error(`Unexpected response: ${res.status}`);
      }

      const json = (await res.json()) as ApiResponseSuccess | ApiResponseError;
      if (json.status !== 200) {
        const errJson = json as ApiResponseError;
        throw new Error(errJson.error);
      }
      const successResponse = json as ApiResponseSuccess;
      promotions = successResponse.data;
      meta = successResponse.meta;
      // totalData = meta?.pagination?.total ?? 0;
      // totalPage = meta?.pagination?.pages ?? 0;

      // console.log(promotions, meta);

      
    } catch (e: any) {
      error = e.message;
      console.error("Error fetching programs:", e);
    } finally {
      loading = false;
    }
  }

  let chartRef: Chart;
  let traffSeries: number[] = $state([0, 0]);

  // $effect(() => {
  //   chartOptions.series = series;
  // });

  // ✅ Chart Series
  let series = $state([
    {
      name: 'Promotion This Year',
      color: '#EF562F',
      data: Array(12).fill(0),
    },
  ]);
  
  let chartOptions = $derived({ 
      ...getChartOptions(false),
      series: series
  });

 // ✅ State
  export const overdues = $state<Array<PromotionWithCategory>>([]);
  export const dueSoon = $state<Array<PromotionWithCategory>>([]);
  export const upcomings = $state<Array<PromotionWithCategory>>([]);
  export const employeePromotions = $state<Array<PromotionWithCategory>>([]);
  export const eligibles = $state<Array<PromotionWithCategory>>([]);
  export const notEligibles = $state<Array<PromotionWithCategory>>([]);

  let eligibleCount = $state(0);
  let notEligibleCount = $state(0);

  export const dark = $state(false);

  const trafficData = $derived((): TrafficData => {
    return {
      labels: ["Eligible", "Not Eligible"],
      colors: ['#17B0BD', '#EF562F'],
      series: [...traffSeries],
    };
  });

  const traffPromotions = $derived((): DeviceOption[] => [
    {
      title: 'Eligible',
      subtitle: eligibleCount.toString(),
      IconOption: {
        icon: DesktopPcOutline,
      },
    },
    {
      title: 'Not Eligible',
      subtitle: notEligibleCount.toString(),
      IconOption: {
        icon: MobilePhoneOutline,
      },
    },
  ]);


  // ✅ Static UI Text
  export const statsCont = {
    title: 'Employee Promotion',
    tab1Title: 'Eligible',
    tab2Title: 'Not Eligible',
  };

  let traffOptions = $derived(
    // Panggil trafficOptions() dan buat SALINAN BARU dari hasilnya
    { 
        ...trafficOptions(trafficData(), dark) 
    }
  );

  // ✅ Fetch + Update
  onMount(async () => {
    await fetchPromotionList();

    const overdueList = (promotions?.regular_promotions?.overdue_promotions ?? []).map(p => ({
        ...p,
        category: 'overdue' as const // Menggunakan 'as const' untuk literal type
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

    let countEligible = 0;
    let countNotEligible = 0;
    for (const val of employeePromotions) {
      if (val.is_eligible && countEligible < 5){
        eligibles.push(val);
        countEligible += 1;
      } else {
        if (countNotEligible < 5) {
          notEligibles.push(val);
          countNotEligible += 1;
        }
      }
    };

    const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

    const counts = monthKeys.map((m) => {
      const raw = (promotions?.regular_promotions?.this_year_promotion_count ?? {})[m] as string | number | null | undefined;;
      if (typeof raw === 'number' && !isNaN(raw)) return raw;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed !== '' && !isNaN(Number(trimmed))) return Number(trimmed);
      }
      return 0;
    });
    console.log(counts);
    series[0].data = counts;

    chartOptions.series = series;

    const totalCount = Number(eligibleCount) + Number(notEligibleCount)
    const eligiblePercentage = Number(((Number(eligibleCount) / totalCount) * 100).toFixed(2))
    const notEligiblePercentage = Number(((Number(notEligibleCount) / totalCount) * 100).toFixed(2))
    traffSeries = [eligiblePercentage, notEligiblePercentage];
  });
</script>

<div class="mt-px space-y-4">
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <div class="flex flex-col gap-4">

      <Traffic devices={traffPromotions()}>
        {#snippet chart()}
          {#if eligibleCount > 0 || notEligibleCount > 0 || (traffSeries.length > 0 && traffSeries[0] !== 0)}
              <Chart options={traffOptions} /> 
          {/if}
        {/snippet}
      </Traffic>
    </div>
    <Stats eligible={eligibles} notEligible={notEligibles} {...statsCont}></Stats>
  </div>
  <div class="grid gap-4 ">
    {#if series[0].data.some(d => d > 0)}
      <ChartWidget chartOptions={chartOptions} title="2025" subtitle="Promotion" />
    {/if}  
  </div>
</div>
