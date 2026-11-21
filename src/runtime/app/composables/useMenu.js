import menuData from "~/assets/json/data_menu.json";

export default function useMenu() {
  const userProfile = useUserProfileStore();
  console.log("userProfile.getData --------------------- ",userProfile.getData)

  const permissions = computed(
    () => userProfile.getData?.permissions ?? []
  );

  const roles = computed(
    () => userProfile.getData?.roles ?? []
  );
  const matches = (required, granted) => {
    if (!required) return true;

    const requiredValues = Array.isArray(required)
      ? required
      : [required];

    return requiredValues.some(value =>
      granted.includes(value)
    );
  };

  const filterItems = (items = []) =>
    items
      .filter(item =>
        matches(item.permission, permissions.value) &&
        matches(item.role, roles.value)
      )
      .map(item => ({
        ...item,
        children: item.children?.length
          ? filterItems(item.children)
          : item.children,
      }));

  return computed(() => ({
    menu: filterItems(menuData.menu),
    bottom: filterItems(menuData.bottom),
  }));
}