import { buildHex } from "./compile";
import "@p4labs/elements";
import { ArduinoIDEContainer } from "@p4labs/elements";
import { ArduinoUnoElement, BuzzerElement } from "@wokwi/elements";
import { ArduinoUno } from "@p4labs/hardware";
import { Component } from "@p4labs/hardware/dist/esm/Component";

class BuzzerComponent extends Component {
  buzzerElement: BuzzerElement;
  constructor(pin: number, label: string, buzzerElement: BuzzerElement) {
    super(pin, label);
    this.buzzerElement = buzzerElement;
  }
  update(pinState: boolean) {
    this.buzzerElement.hasSignal = pinState;
  }
  reset() {
    this.buzzerElement.hasSignal = false;
  }
}

const arduinoElement: ArduinoUnoElement = document.querySelector(
  "#setup-workshop-wokwi-arduino"
);

const buzzerElement: BuzzerElement = document.querySelector("#buzzer1");

const buzzerComponent = new BuzzerComponent(12, "buzzer1", buzzerElement);

//buzzerComponent.reset();

const unoBoard = new ArduinoUno();

//ledComponent.update(true);
//ledComponent.reset();

if (arduinoElement) unoBoard.setUnoElement(arduinoElement);

//unoBoard.addConnection(6, ledComponent);
unoBoard.addConnection(12, buzzerComponent);

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
      value: `int buzzer = 12;
      void setup() {}
      void loop() {
        tone(buzzer, 1000, 500); //play a tone with frequency of 1000hz for 500 ms 
        delay(1000);
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
arduinoContainer?.addEventListener("_status-change", (e: CustomEvent) =>
  handleIDEStatusChange(e)
);
