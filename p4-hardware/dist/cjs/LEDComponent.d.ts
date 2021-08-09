import { Component } from "@p4labs/hardware/dist/esm/Component";
import { LEDElement } from "@wokwi/elements";
export declare class LEDComponent extends Component {
  private ledElement: LEDElement;
  constructor(pin: number, label: string, ledElement: LEDElement) {
    super(pin, label);
    this.ledElement = ledElement;
  }
  update(pinState: boolean) {
    this.ledElement.value = pinState;
  }
  reset() {
    this.ledElement.value = false;
  }
}
