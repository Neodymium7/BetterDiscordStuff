import { appSelector, layerContainerSelector, tooltipClasses } from "./discordmodules";

export default class Tooltip {
	private target: HTMLElement;
	private tooltip: HTMLElement;
	private layerContainer: HTMLElement;
	private ref: HTMLElement | null = null;
	private clearListeners: () => void;

	constructor(target: HTMLElement, text: string) {
		this.target = target;
		this.layerContainer = document.querySelector(`${appSelector} ~ ${layerContainerSelector}`)!;

		const pointerBg = document.createElement("div");
		pointerBg.className = tooltipClasses.tooltipPointerBg + " " + tooltipClasses.tooltipPointer;
		pointerBg.style.left = "calc(50% + 0px)";

		const pointer = document.createElement("div");
		pointer.className = tooltipClasses.tooltipPointer;
		pointer.style.left = "calc(50% + 0px)";

		const content = document.createElement("div");
		content.className = tooltipClasses.tooltipContent;
		content.innerHTML = text;

		this.tooltip = document.createElement("div", {});
		this.tooltip.style.position = "fixed";
		this.tooltip.style.opacity = "0";
		this.tooltip.style.transform = "scale(0.95)";
		this.tooltip.style.transition = "opacity 0.1s, transform 0.1s";
		this.tooltip.className = `${tooltipClasses.tooltip} ${tooltipClasses.tooltipTop} ${tooltipClasses.tooltipPrimary}`;
		this.tooltip.appendChild(pointerBg);
		this.tooltip.appendChild(pointer);
		this.tooltip.appendChild(content);

		const show = () => this.show();
		const hide = () => this.hide();

		this.target.addEventListener("mouseenter", show);
		this.target.addEventListener("mouseleave", hide);

		this.clearListeners = () => {
			this.target.removeEventListener("mouseenter", show);
			this.target.removeEventListener("mouseleave", hide);
		};
	}

	show() {
		this.ref = this.tooltip.cloneNode(true) as HTMLElement;
		this.layerContainer.appendChild(this.ref);

		const targetRect = this.target.getBoundingClientRect();
		const tooltipRect = this.ref.getBoundingClientRect();

		this.ref.style.top = `${targetRect.top - tooltipRect.height - 8}px`;
		this.ref.style.left = `${targetRect.left + targetRect.width / 2 - tooltipRect.width / 2}px`;
		this.ref.style.opacity = "1";
		this.ref.style.transform = "none";
	}

	hide() {
		const ref = this.ref;
		if (!ref) return;
		ref.style.opacity = "0";
		ref.style.transform = "scale(0.95)";
		setTimeout(() => ref?.remove(), 100);
	}

	forceHide() {
		this.ref?.remove();
	}

	remove() {
		this.clearListeners();
		this.forceHide();
	}
}
