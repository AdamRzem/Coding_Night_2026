export type CartItem = { id: number; name: string };

function createCartStore() {
	let items = $state<CartItem[]>([]);

	return {
		get items() {
			return items;
		},
		get count() {
			return items.length;
		},
		add(dish: CartItem) {
			items = [...items, dish];
		},
		remove(index: number) {
			items = items.filter((_, i) => i !== index);
		},
		clear() {
			items = [];
		}
	};
}

export const cart = createCartStore();
