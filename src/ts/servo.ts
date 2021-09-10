import { buildHex } from "./compile";
import "@p4labs/elements";
import { ArduinoIDEContainer } from "@p4labs/elements";
import { ArduinoUnoElement, LEDElement, PushbuttonElement } from "@wokwi/elements";
import { ArduinoUno } from "@p4labs/hardware";
import { Component } from "@p4labs/hardware/dist/esm/Component";


class PushComponent extends Component {
  pushElement: PushbuttonElement;
  constructor(pin: number, label: string, pushElement: PushbuttonElement) {
    super(pin, label);
    this.pushElement = pushElement;
  }
  update(pinState: boolean) {
    this.pushElement.pressed = pinState;
  }
  reset() {
    this.pushElement.pressed = false;
  }

  triggerListener(unoBoard: ArduinoUno) {
    const button = document.querySelector<HTMLElement>("wokwi-pushbutton");
    this.setupListener(button, unoBoard);
  }

  setupListener(button: Element, unoBoard: ArduinoUno) {
    button.addEventListener("button-press", () => {
      unoBoard.writeDigitalPin(this.pin, true);
    });
    button.addEventListener("button-release", () => {
      unoBoard.writeDigitalPin(this.pin, false);
    });
  }
}

class LEDComponent extends Component {
  ledElement: LEDElement;
  constructor(pin: number, label: string, ledElement: LEDElement) {
    super(pin, label);
    this.ledElement = ledElement;
  }
}

const arduinoElement: ArduinoUnoElement = document.querySelector(
  "#setup-workshop-wokwi-arduino"
);

const ledElement: LEDElement = document.querySelector("led1");

const pushbuttonElement: PushbuttonElement = document.querySelector("#button1");

const pushCompo = new PushComponent(2, "button1", pushbuttonElement);

const ledComponent = new LEDComponent(6, "led1", ledElement);

const unoBoard = new ArduinoUno();

if (arduinoElement) unoBoard.setUnoElement(arduinoElement);

unoBoard.addConnection(6, ledComponent);
unoBoard.addConnection(2, pushCompo);
pushCompo.triggerListener(unoBoard);

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
      value: `//setup global variables here
      int button = 2; // Choose the button pin. You can choose any other pin.
      //int LED_BUILTIN = 13; // We have chosen the builtin led pin.
      // the setup function runs only one time in the startup of your board.
      void setup() {
      pinMode(button, INPUT);// initialize digital pin button as an input.
      pinMode(LED_BUILTIN, OUTPUT);// initialize digital pin led as an output.
      }
      // the loop function runs over and over again forever
      void loop() {
      int state = digitalRead(button);
      if (state == HIGH) {
      digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
        } else {
      digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
        }
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
