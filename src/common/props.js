export default {
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
};
