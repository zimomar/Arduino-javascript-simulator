import { buildHex } from "./compile";
import "@p4labs/elements";
import { ArduinoIDEContainer } from "@p4labs/elements";
import { ArduinoUnoElement, PotentiometerElement } from "@wokwi/elements";
import { ArduinoUno } from "@p4labs/hardware";
import { Component } from "@p4labs/hardware/dist/esm/Component";

class PotentiometerComponent extends Component {
  potentiometerElement: PotentiometerElement;
  constructor(
    pin: number,
    label: string,
    potentiometerElement: PotentiometerElement
  ) {
    super(pin, label);
    this.potentiometerElement = potentiometerElement;
  }
  setValue(value: number) {
    if (value <= 100 && value >= 0) {
      this.potentiometerElement.value = value;
    }
  }
  reset() {
    this.potentiometerElement.value = 0;
  }
}

const arduinoElement: ArduinoUnoElement = document.querySelector(
  "#setup-workshop-wokwi-arduino"
);

const potentiometerElement: PotentiometerElement = document.querySelector("#potentiometer1");

const potentiometerComponent = new PotentiometerComponent(
  5,
  "pot1",
  potentiometerElement
);

const unoBoard = new ArduinoUno();

//ledComponent.update(true);
//ledComponent.reset();

if (arduinoElement) unoBoard.setUnoElement(arduinoElement);

unoBoard.addConnection(6, potentiometerComponent);

let editor: any; // eslint-disable-line @typescript-eslint/no-explicit-any
let simulationStatus = "off";

window.require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs",
  },
});
window.require(["vs/editor/editor.main"], () => {
  editor = monaco.editor.create(
    document.querySelector("#setup-workshop-monaco"),
    {
      value: `int potentiometer = 5;    // select the input pin for the potentiometer
      int BUILTIN_LED = 13;   // select the builtin LED
      void setup() {
       pinMode(BUILTIN_LED, OUTPUT);  // declare the led pin as an OUTPUT
      }
      void loop() {
        int val = digitalRead(potentiometer);    // read the value from the sensor
        digitalWrite(BUILTIN_LED, HIGH);  // turn on the led
        delay(val);                  // wait for the select time from potentiometer
        digitalWrite(BUILTIN_LED, LOW);   // turn off the led
        delay(val);                  // wait for the select time from potentiometer
      }

`,
      language: "cpp",
      minimap: { enabled: false },
      automaticLayout: true,
    }
  );
});

const compilerOutputText = document.querySelector("#compiler-output-text");
const serialOutputText = document.querySelector("#serial-output-text");

const arduinoContainer = document.querySelector<ArduinoIDEContainer>(
  "#setup-workshop-ide-container"
);

unoBoard.setSerialOutputElement(serialOutputText);
unoBoard.setTimeLabelElement(arduinoContainer);

async function compileAndRun() {
  if (serialOutputText) serialOutputText.textContent = "";
  try {
    const result = await buildHex(editor.getModel().getValue());
    if (simulationStatus === "compiling") {
      if (result.hex) {
        if (arduinoContainer) arduinoContainer.status = "on";
        if (compilerOutputText) compilerOutputText.textContent = "";

        simulationStatus = "on";
        unoBoard.executeProgram(result.hex);
      } else {
        simulationStatus = "off";
        if (arduinoContainer) arduinoContainer.status = "off";
        if (compilerOutputText) compilerOutputText.textContent = result.stderr;
      }
    }
  } catch (err) {
    simulationStatus = "off";
    if (arduinoContainer) arduinoContainer.status = "off";

    alert("Failed: " + err);
  }
}

function stopCode() {
  unoBoard.stopExecute();
}

function handleIDEStatusChange(e: CustomEvent) {
  const status = e.detail.status;
  if (status === "compiling" && simulationStatus !== "compiling") {
    compileAndRun();
  } else if (status === "off" && simulationStatus !== "off") {
    stopCode();
  }
  simulationStatus = status;
}
arduinoContainer?.addEventListener("_status-change", (e: CustomEvent) =>
  handleIDEStatusChange(e)
);