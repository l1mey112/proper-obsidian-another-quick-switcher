import { App, Platform, setIcon } from 'obsidian'
import type { SearchCommand, Settings } from "./settings";
import { showSearchDialog } from './commands';

// from https://github.com/darlal/obsidian-switcher-plus
// src/switcherPlus/mobileLauncher.ts

let coreMobileLauncherButtonEl: HTMLElement | null;

// Reference to the custom launcher button that was created
let qspMobileLauncherButtonEl: HTMLElement | null;

const SEARCH_COMMAND_PREFIX = "search-command";

export function install_mobile_override_shim(app: App, settings: Settings) {
	if (
		!Platform.isMobile ||
		coreMobileLauncherButtonEl
	) {
		return
	}

    let qspLauncherButtonEl: HTMLElement | null = null;
	const coreLauncherButtonEl = getCoreLauncherButtonElement(app)

	// see src/commands.ts
	const search_command = settings.searchCommands.map((command) => {
		return () => {
			showSearchDialog(app, settings, command)
		}
	})[0]

	if (!search_command) {
		return
	}

	if (coreLauncherButtonEl) {
		const qspButtonEl = createQSPLauncherButton(
			coreLauncherButtonEl,
			search_command,
		);

		if (replaceCoreLauncherButtonWithQSPButton(coreLauncherButtonEl, qspButtonEl)) {
			coreMobileLauncherButtonEl = coreLauncherButtonEl as HTMLElement;
			qspMobileLauncherButtonEl = qspButtonEl;
			qspLauncherButtonEl = qspButtonEl;
		}
	}

	return qspLauncherButtonEl
}

// src/types/obsidian/index.d.ts
declare module 'obsidian' {
	export interface App {
		mobileNavbar: {
			containerEl: HTMLElement;
		};
	}
}

// src/settings/switcherPlusSettings.ts
const mobileLauncher = {
	isEnabled: false,
	iconName: '',
	coreLauncherButtonIconSelector: 'span.clickable-icon',
	coreLauncherButtonSelector:
	  '.mobile-navbar-action:has(span.clickable-icon svg.svg-icon.lucide-plus-circle)',
}

/**
 * Finds the "⊕" button element using the default selector.
 * If that fails, retries using the selector stored in settings
 * @param  {App} app
 * @param  {MobileLauncherConfig} launcherConfig
 * @returns Element The button Element
 */
function getCoreLauncherButtonElement(
	app: App,
  ): Element | null {
	let coreLauncherButtonEl: Element | null = null;
	const containerEl = app?.mobileNavbar?.containerEl;
  
	if (containerEl) {
		coreLauncherButtonEl = containerEl.querySelector(
			mobileLauncher.coreLauncherButtonSelector,
		);
	}
	
	return coreLauncherButtonEl
}

/**
 * Creates a custom launcher button element by cloning then modifying coreLauncherButtonEl
 * @param  {Element} coreLauncherButtonEl the ootb system launcher button element
 * @param  {MobileLauncherConfig} launcherConfig
 * @param  {()=>void} onclickListener event handler to attach to the new custom button
 * @returns HTMLElement the new custom button element that was created
 */
function createQSPLauncherButton(
	coreLauncherButtonEl: Element,
	onclickListener: () => void,
  ): HTMLElement | null {
	let qspLauncherButtonEl: HTMLElement | null = null;
  
	if (coreLauncherButtonEl) {
	  // April 2024: cloneNode(true) should perform a deep copy, but does not copy
	  // any event handlers that were attached using addEventListener(), which
	  // corePlusButtonEl does use, so it can be safely cloned.
	  // Additionally, cloneNode() will copy element ID/Name as well which could result
	  // in duplicates, but corePlusButtonEl does not contain ID/Name so it's also safe
	  qspLauncherButtonEl = coreLauncherButtonEl.cloneNode(true) as HTMLElement;
  
	  if (qspLauncherButtonEl) {
		const { iconName, coreLauncherButtonIconSelector } = mobileLauncher;
  
		qspLauncherButtonEl.addClass('qsp-mobile-launcher-button');
		qspLauncherButtonEl.addEventListener('click', onclickListener);
  
		if (iconName?.length) {
		  // Override the core icon, if a custom icon file name is provided
		  const iconEl = qspLauncherButtonEl.querySelector(coreLauncherButtonIconSelector);
  
		  if (iconEl) {
			setIcon(iconEl as HTMLElement, iconName);
		  }
		}
	  }
	}
  
	return qspLauncherButtonEl;
}

/**
 * Remove coreButtonEl from DOM and replaces it with qspButtonEl
 * @param  {Element} coreButtonEl
 * @param  {HTMLElement} qspButtonEl
 * @returns boolean True if succeeded
 */
function replaceCoreLauncherButtonWithQSPButton(
	coreButtonEl: Element,
	qspButtonEl: HTMLElement | null,
  ): boolean {
	let isSuccessful = false;
  
	if (coreButtonEl && qspButtonEl) {
	  // Hide the button before adding to DOM
	  const initialDisplay = qspButtonEl.style.display;
	  qspButtonEl.style.display = 'none';
  
	  if (coreButtonEl.insertAdjacentElement('beforebegin', qspButtonEl)) {
		coreButtonEl.remove();
		isSuccessful = true;
	  }
  
	  qspButtonEl.style.display = initialDisplay;
	}
  
	return isSuccessful;
}