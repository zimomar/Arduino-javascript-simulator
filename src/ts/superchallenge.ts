import { buildHex } from "./compile";
import "@p4labs/elements";
import { ArduinoIDEContainer } from "@p4labs/elements";
import { ArduinoUnoElement, LEDElement } from "@wokwi/elements";
import { ArduinoUno } from "@p4labs/hardware";
import { Component } from "@p4labs/hardware/dist/esm/Component";

class LEDComponent extends Component {
  ledElement: LEDElement;
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

const arduinoElement: ArduinoUnoElement = document.querySelector(
  "#setup-workshop-wokwi-arduino"
);

const ledElement: LEDElement = document.querySelector("#led2");

const ledComponent = new LEDComponent(6, "led2", ledElement);

const unoBoard = new ArduinoUno();

//ledComponent.update(true);
//ledComponent.ledElement.brightness = 2;

if (arduinoElement) unoBoard.setUnoElement(arduinoElement);

unoBoard.addConnection(6, ledComponent);

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
      value: `int led = 6;           // the PWM pin the LED is attached to
      int brightness = 0;    // inital brightness of the LED
      int fadeAmount = 0.02;    // how many points to fade the LED by
      
      void setup() { // the setup routine runs once
        pinMode(led, OUTPUT); // declare pin 6 to be an output:
      }
      
      void loop() { // the loop routine runs over and over again forever:
        digitalWrite(led, brightness); // set the brightness of pin 6:
        brightness += fadeAmount; // change the brightness for next time
        // reverse the direction of the fading at the ends of the fade:
        if (brightness <= 0 || brightness >= 1) fadeAmount = -fadeAmount;
        delay(30);  // wait for 30 milliseconds to see the dimming effect
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