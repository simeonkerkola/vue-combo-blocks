export default function getProps(isVue3) {
  return {
    ...(isVue3 ? {
      modelValue: {
        default: null,
      },
    } : {
      value: {
        default: null,
      },
    }
    ),
    items: {
      type: Array,
      required: true,
    },
    itemToString: {
      type: Function,
      default: (item) => (item ? String(item) : ''),
    },
    stateReducer: {
      type: Function,
      default: (s, a) => a.changes,
    },
    getItemId: {
      type: Function,
      default(i) {
        return `v-${this.idCounter}-vue-combo-blocks-item-${i}`;
      },
    },
    menuId: {
      type: String,
      default: '',
    },
    inputId: {
      type: String,
      default: '',
    },
    labelId: {
      type: String,
      default: '',
    },
    scrollIntoView: {
      type: Boolean,
      default: true,
    },
    circular: {
      type: Boolean,
      default: true,
    },
  };
}
