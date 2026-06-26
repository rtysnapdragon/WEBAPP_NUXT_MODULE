// composables/usePageBreadcrumb.ts

import type {
  RBreadcrumbState,
} from '~/types/breadcrumb'

export const usePageBreadcrumb = (
  config: Partial<RBreadcrumbState>,
) => {
  const breadcrumb = useBreadcrumb()

  onMounted(() => {
    breadcrumb.set(config)
  })

  onBeforeUnmount(() => {
    breadcrumb.clear()
  })

  return breadcrumb
}

// Example usage

// usePageBreadcrumb({
//   showBack: true,

//   backTooltip: 'Back to dashboard',

//   backAction: () => navigateTo('/dashboard'),

//   items: [
//     {
//       label: 'Dashboard',
//       to: '/',
//       icon: 'i-lucide-home',
//     },

//     {
//       label: 'Users',
//       to: '/users',

//       children: [
//         {
//           label: 'Create User',
//           icon: 'i-lucide-plus',
//           to: '/users/create',
//         },

//         {
//           label: 'User Roles',
//           icon: 'i-lucide-shield',
//           to: '/users/roles',
//         },

//         {
//           label: 'Permission Matrix',
//           icon: 'i-lucide-lock',
//           onClick: () => {
//             console.log('Permission clicked')
//           },
//         },
//       ],
//     },

//     {
//       label: 'Detail',
//     },
//   ],
// })



// <!-- Full composable usage -->

// <script setup lang="ts">
// useMountedPageHeader({
//   title: 'Wedding Dashboard',

//   subtitle: 'Manage invitation event',

//   icon: 'i-lucide-layout-dashboard',

//   showBack: true,

//   backTooltip: 'Back to dashboard',

//   backAction: () => navigateTo('/'),

//   items: [
//     {
//       label: 'Dashboard',
//       to: '/',
//       icon: 'i-lucide-home',
//     },

//     {
//       label: 'Users',

//       to: '/users',

//       children: [
//         {
//           label: 'Create User',
//           icon: 'i-lucide-plus',
//           to: '/users/create',
//         },

//         {
//           label: 'Roles',
//           icon: 'i-lucide-shield',
//           to: '/users/roles',
//         },
//       ],
//     },

//     {
//       label: 'Detail',
//     },
//   ],
// })
// </script>

// <template>
//   <RPageHeader>

//     <template #actions>

//       <UButton
//         label="Create"
//         icon="i-lucide-plus"
//       />

//       <UButton
//         label="Export"
//         variant="soft"
//         color="neutral"
//       />

//     </template>

//   </RPageHeader>
// </template>