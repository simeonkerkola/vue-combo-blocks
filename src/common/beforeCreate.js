let idCounter = 0;

export default function beforeCreate() {
  this.idCounter = idCounter.toString();
  idCounter += 1;
}
