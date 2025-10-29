<script lang="ts">
  import { AppsMenu, UserMenu, NotificationList } from '$lib';
  import { DarkMode, Dropdown, DropdownItem, NavBrand, NavLi, NavUl, Navbar, Search, DropdownDivider } from 'flowbite-svelte';
  import {
    UsersGroupSolid,
    AnnotationSolid,
    CameraPhotoOutline,
    DownloadSolid,
    HeartSolid,
    ChevronDownOutline
  } from 'flowbite-svelte-icons';

  import '../../app.css';
  import Users from '../data/users.json';

  import type { NotificationProps } from '$lib/types';

  type NotificationData = Omit<NotificationProps, 'children'> & {
    content: string;
  };

  interface Props {
    fluid?: boolean;
    drawerHidden?: boolean;
    list?: boolean;
  }

  let { fluid = true, drawerHidden = $bindable(false), list = false }: Props = $props();

</script>

<Navbar class="mx-10 sm:mx-0">
  <NavBrand href="/" class="mx-10">
    <img src="/images/panda-kepang-logo.svg" class="me-2.5 h-6 sm:h-8" alt="Panda Kepang Logo" />
    <span class="ml-px self-center text-xl font-semibold whitespace-nowrap sm:text-2xl dark:text-white"> Panda Kepang </span>
  </NavBrand>
  <div class="ms-auto flex items-center text-gray-500 sm:order-2 dark:text-gray-300">
    <!-- <NotificationList {notifications} /> -->
    <!-- <AppsMenu {menu} /> -->
    <DarkMode />
    <UserMenu {...Users[0]} >
      <DropdownDivider />
      <DropdownItem>Sign out</DropdownItem>
    </UserMenu>
  </div>
</Navbar>
