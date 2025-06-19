/*jslint es6 */
/*global CrComLib, webXPanelModule, hardButtonsModule, templateVersionInfoModule, projectConfigModule, featureModule, templateAppLoaderModule, translateModule, serviceModule, utilsModule, navigationModule */

const templatePageModule = (() => {
	'use strict';

	let triggerview = null;
	let horizontalMenuSwiperThumb = null;
	let selectedPage = { name: "" };
	let totalPreloadPage = 0;
	let preloadPageLoaded = 0;
	let firstLoad = false;
	let pageLoadTimeout = 2000;
	let isWebXPanelInitialized = false; // avoid calling connection method multiple times


	/**
	 * This is public method for bottom navigation to navigate to next page
	 * @param {number} idx is selected index for navigate to appropriate page
	 */
	function navigateTriggerViewByPageName(pageName) {
		// If the previous and selected page are same then exit
		if (pageName !== selectedPage.pageName) {
			const pageList = projectConfigModule.getNavigationPages();
			const pageObject = projectConfigModule.getNavigationPages().find(page => page.pageName === pageName);
			const oldPage = JSON.parse(JSON.stringify(selectedPage));
			// Loop and set url and receiveStateUrl based on proper preload and cachePage values
			if (oldPage.preloadPage === true && oldPage.cachePage === false) {
				const htmlImportSnippet = document.getElementById(oldPage.pageName + "-import-page");
				htmlImportSnippet.removeAttribute("url");
				htmlImportSnippet.setAttribute("receiveStateShow", oldPage.pageName + "-import-page-show");
				htmlImportSnippet.setAttribute("noShowType", "remove");
			} else if (oldPage.preloadPage === false && oldPage.cachePage === true) {
				const htmlImportSnippet = document.getElementById(oldPage.pageName + "-import-page");
				htmlImportSnippet.removeAttribute("receiveStateShow");
				if (htmlImportSnippet.hasAttribute("url") === false || !htmlImportSnippet.getAttribute("url") || htmlImportSnippet.getAttribute("url") === "") {
					htmlImportSnippet.setAttribute("url", oldPage.fullPath + oldPage.fileName);
				}
				htmlImportSnippet.setAttribute("noShowType", "display");
			}
			CrComLib.publishEvent("b", "active_state_class_" + oldPage.pageName, false);
			selectedPage = JSON.parse(JSON.stringify(pageObject));
			CrComLib.publishEvent("b", "active_state_class_" + selectedPage.pageName, true);
			if (triggerview !== null) {
				const activeIndex = projectConfigModule.getNavigationPages().findIndex(data => data.pageName === pageName);
				const prevIndex = projectConfigModule.getNavigationPages().findIndex(data => data.pageName === oldPage.pageName);
				// On first load, hide all pages except for the default page.
				if (prevIndex < 0) {
					hideInactivePages(activeIndex);
				} else {
					const page = triggerview.childrenOfCurrentNode[activeIndex].childrenOfCurrentNode[0].childrenOfCurrentNode[0];
					page.classList.remove('ch5-hide-vis');
				}
				// Add animation to the page when exiting the viewport.
				const subscriptionHtmlSnippetPrevIndex = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:' + pageList[prevIndex]?.pageName + '-import-page', (value) => {
					if (value['loaded']) {
						if (triggerview.allowPageAnimation() &&
							projectConfigModule.getNavigationPages()[prevIndex]?.cachePage &&
							(projectConfigModule.getNavigationPages()[prevIndex]?.animation?.transitionIn || projectConfigModule.getNavigationPages()[prevIndex]?.animation?.transitionOut) &&
							triggerview.childrenOfCurrentNode[prevIndex]?.childrenOfCurrentNode[0] &&
							triggerview.childrenOfCurrentNode[prevIndex]?.childrenOfCurrentNode[0].childrenOfCurrentNode[0]) {  //&& prevIndex !== -1) {
							addAnimationClass(prevIndex, 'OUT');
						}
					}
				});
				setTimeout(() => {
					CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:' + pageList[prevIndex]?.pageName + '-import-page', subscriptionHtmlSnippetPrevIndex);
				}, 100);
				try {
					// menuMoveInViewPort();

					if (projectConfigModule.getMenuOrientation() === "horizontal" || projectConfigModule.getMenuOrientation() === "vertical") {
						let intersectionOptions = {
							rootMargin: '0px',
							threshold: 1.0
						};
						const intersectionObserver = new IntersectionObserver((entries, observer) => {
							entries.forEach(entry => {
								if (entry.isIntersecting === false) {
									CrComLib.publishEvent("n", "scrollToMenu", activeIndex);
								}
							});
							intersectionObserver.unobserve(document.getElementById('menu-list-id-' + activeIndex));
						}, intersectionOptions);
						intersectionObserver.observe(document.getElementById('menu-list-id-' + activeIndex));
						// intersectionObserver.unobserve(document.getElementById('menu-list-id-' + activeIndex));
					}
					triggerview.setActiveView(activeIndex);
				} catch (e) {
					console.error(e);
				}
				// Add animation to the page when entering the viewport.
				const subscriptionHtmlSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:' + pageList[activeIndex]?.pageName + '-import-page', (value) => {
					if (value['loaded']) {
						if (triggerview.allowPageAnimation() &&
							projectConfigModule.getNavigationPages()[activeIndex]?.cachePage &&
							(projectConfigModule.getNavigationPages()[activeIndex]?.animation?.transitionIn || projectConfigModule.getNavigationPages()[activeIndex]?.animation?.transitionOut) &&
							triggerview.childrenOfCurrentNode[activeIndex]?.childrenOfCurrentNode[0] &&
							triggerview.childrenOfCurrentNode[activeIndex]?.childrenOfCurrentNode[0].childrenOfCurrentNode[0]) {
							addAnimationClass(activeIndex, 'IN');
						}
					}
				});

				setTimeout(() => {
					CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:' + pageList[activeIndex]?.pageName + '-import-page', subscriptionHtmlSnippet);
				}, 100);
			}
			navigationModule.goToPage(pageName);
		}
	}
	// for scrollbar issue CH5C-28535
	function resizeWindow(event) {
		window.dispatchEvent(new Event('resize'));
		removeEventListener(event.target);
	}

	function removeEventListener(ele) {
		ele.removeEventListener(animationend, resizeWindow);
	}


	function hideInactivePages(activeIndex) {
		const subscriptions = [];
		const pageList = projectConfigModule.getNavigationPages();
		for (let i = 0; i < pageList.length; i++) {
			if (activeIndex !== i && pageList[i].preloadPage === true) { // The hide class is only needed for pages with preloading true.
				const subscriptionHtmlSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:' + pageList[i].pageName + '-import-page', (value) => {
					// console.log(pageList[i].pageName + ' --> ' + value['loaded']);
					if (value['loaded']) {
						const page = triggerview.childrenOfCurrentNode[i].childrenOfCurrentNode[0].childrenOfCurrentNode[0];
						page.classList.add('ch5-hide-vis');
					}
				});
				subscriptions.push(subscriptionHtmlSnippet);
			} else if (pageList[activeIndex]?.animation?.transitionIn) { // for scrollbar issue CH5C-28535
				const page = triggerview.childrenOfCurrentNode[activeIndex]?.childrenOfCurrentNode[0]?.childrenOfCurrentNode[0];
				page.addEventListener('animationend', resizeWindow);
			}
		}

		for (let i = 0; i < pageList.length; i++) {
			if (activeIndex !== i) {
				setTimeout(() => {
					CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:' + pageList[i].pageName + '-import-page', subscriptions[i]);
				}, 100);
			}
		}
	}

	function addAnimationClass(pageIndex, type) {

		const pageData = projectConfigModule.getNavigationPages()[pageIndex];
		const ch5triggerViewChild = triggerview.childrenOfCurrentNode[pageIndex];
		const page = triggerview.childrenOfCurrentNode[pageIndex].childrenOfCurrentNode[0].childrenOfCurrentNode[0];

		if (pageData?.animation?.transitionIn in CrComLib.transitionIneffects || pageData?.animation?.transitionOut in CrComLib.transitionOuteffects) {
			page.style.setProperty('--animate-duration', pageData?.animation?.transitionDuration ? pageData?.animation?.transitionDuration : '1s');
			page.style.setProperty('--animate-delay', pageData?.animation?.transitionDelay ? pageData?.animation?.transitionDelay : '0s');
		}
		if (type === 'OUT') {
			CrComLib.removeTransition(page, pageData?.animation?.transitionIn, 'IN');
			page.classList.remove("ch5-hide-vis", "page-height-vh");
			if (pageData?.animation?.transitionOut && (pageData?.animation?.transitionOut in CrComLib.transitionOuteffects)) {
				CrComLib.setTransition(page, pageData.animation.transitionOut, 'OUT');
				ch5triggerViewChild.classList.add('ch5-show-vis-position');
				page.classList.add('page-height-vh');
			}
		} else {
			CrComLib.removeTransition(page, pageData?.animation?.transitionOut, 'OUT');
			page.classList.remove("ch5-hide-vis", "page-height-vh");
			ch5triggerViewChild.classList.remove('ch5-show-vis-position');
			if (pageData?.animation?.transitionIn && (pageData?.animation?.transitionIn in CrComLib.transitionIneffects)) {
				CrComLib.setTransition(page, pageData.animation.transitionIn, 'IN');
			}
		}
	}

	function menuMoveInViewPort() {
		// 	// TODO: Subscribe and unsubscribe to avoid unwanted scrolls
		// 	// if (response.menuOrientation === 'horizontal') { // || response.menuOrientation === 'vertical') {
		// CrComLib.subscribeInViewPortChange(document.getElementById('menu-list-id-' + activeIndex), (element, isInViewPort) => {
		// 	if (!isInViewPort) {
		// 		console.log("Publishing now", activeIndex);
		// 		CrComLib.publishEvent("n", "scrollToMenu", activeIndex);
		// 	}
		// 	// setTimeout(() => {
		// 	CrComLib.unSubscribeInViewPortChange(document.getElementById('menu-list-id-' + activeIndex));
		// 	// });
		// });
	}

	function setMenuActive() {
		// if (triggerview !== null) {
		// 	if (response.menuOrientation === 'horizontal') { // || response.menuOrientation === 'vertical') {
		// 		CrComLib.publishEvent("n", "scrollToMenu", activeIndex);
		// 	}
		// }
	}

	function navigateTriggerViewByIndex(index) {
		const listOfPages = projectConfigModule.getNavigationPages();
		if (listOfPages.length > 0 && index >= 0 && index <= listOfPages.length) {
			navigateTriggerViewByPageName(listOfPages[index].pageName);
		}
	}

	/**
	 * This is public method to show/hide bottom navigation in smaller screen
	 */
	function openThumbNav() {
		const horizontalMenuSwiperThumb = document.getElementById("horizontal-menu-swiper-thumb");
		horizontalMenuSwiperThumb.className += " open";
		event.stopPropagation();
	}

	/**
	 * This is public method to toggle left navigation sidebar
	 */
	function toggleSidebar() {
		let sidebarToggle = document.getElementById("sidebarToggle");
		if (sidebarToggle) {
			sidebarToggle.classList.toggle("active");
		}
		let navbarThumb = document.querySelector(".swiper-thumb");
		if (navbarThumb) {
			navbarThumb.classList.toggle("open");
		}
	}

	/**
	 * This method will invoke on body click
	 */
	document.body.addEventListener("click", function (event) {
		triggerview = document.querySelector(".triggerview");
		horizontalMenuSwiperThumb = document.getElementById("horizontal-menu-swiper-thumb");

		if (event.target.id === "sidebarToggle") {
			event.stopPropagation();
		} else {
			let navbarThumb = document.querySelector(".swiper-thumb");
			if (navbarThumb) {
				navbarThumb.classList.remove("open");
			}
			if (horizontalMenuSwiperThumb) {
				horizontalMenuSwiperThumb.classList.remove("open");
			}
			let sidebarToggle = document.getElementById("sidebarToggle");
			if (sidebarToggle) {
				sidebarToggle.classList.remove("active");
			}
		}
	});

	/**
	 * Load the emulator, theme, default language and listeners
	 */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-page-import-page', (value) => {
		if (value['loaded']) {
			triggerview = document.querySelector(".triggerview");
			horizontalMenuSwiperThumb = document.getElementById("horizontal-menu-swiper-thumb");

			projectConfigModule.appMainfestData().then((appManifestResponse) => {
				projectConfigModule.projectConfigData().then((projectConfigResponse) => {
					translateModule.initializeDefaultLanguage().then(() => {
						/* Note: You can uncomment below line to enable remote logger.
						 * Refer below documentation link to know more about remote logger.
						 * https://sdkcon78221.crestron.com/sdk/Crestron_HTML5UI/Content/Topics/UI-Remote-Logger.htm
						 */
						// templateRemoteLoggerSettingsModule.setRemoteLoggerConfig(serverIPAddress, serverPortNumber);
						serviceModule.initialize(projectConfigResponse);
						console.initialize();

						// Changes for index.html - Start
						// console.log("appManifestResponse", appManifestResponse["ch5"]["crComLib"], appManifestResponse["ch5"]["ch5Theme"], appManifestResponse["ch5"]["ch5WebXPanel"]);
						// console.log("appManifestResponse", appManifestResponse["ch5"]["crComLib"], appManifestResponse["ch5"]["ch5Theme"], "rags", [{a:1,b: {a:1, b:2}}]);
						const cacheBustVersion = "?v=" + appManifestResponse["ch5"]["ch5Theme"]["version"];
						document.getElementById("favicon").setAttribute("href", projectConfigResponse.faviconPath);
						document.getElementById("shellTemplateSelectedThemeCss").setAttribute("href", "./assets/css/ch5-theme.css" + cacheBustVersion);
						document.getElementById("externalCss").setAttribute("href", "./assets/css/external.css" + cacheBustVersion);

						const widgetsAndStandalonePages = document.getElementById("widgets-and-standalone-pages");
						const widgets = projectConfigResponse.content.widgets;
						for (let i = 0; i < widgets.length; i++) {
							const htmlImportSnippet = document.createElement("ch5-import-htmlsnippet");
							htmlImportSnippet.setAttribute("id", widgets[i].widgetName + "-import-widget");
							htmlImportSnippet.setAttribute("url", widgets[i].fullPath + widgets[i].fileName);
							htmlImportSnippet.setAttribute("show", "false");
							widgetsAndStandalonePages.appendChild(htmlImportSnippet);
						}

						const standAlonePages = projectConfigModule.getAllStandAloneViewPages();
						for (let i = 0; i < standAlonePages.length; i++) {
							const htmlImportSnippet = document.createElement("ch5-import-htmlsnippet");
							htmlImportSnippet.setAttribute("id", standAlonePages[i].pageName + "-import-page");
							htmlImportSnippet.setAttribute("url", standAlonePages[i].fullPath + standAlonePages[i].fileName);
							htmlImportSnippet.setAttribute("show", "false");
							widgetsAndStandalonePages.appendChild(htmlImportSnippet);
						}
						// Changes for index.html - End

						// Header
						if (projectConfigResponse.header.display === true) {
							let dataHeader = "";
							if (projectConfigResponse.header.$component && projectConfigResponse.header.$component !== "") {
								dataHeader = document.getElementById("header-section-page-template2").innerHTML;
							} else {
								dataHeader = document.getElementById("header-section-page-template1").innerHTML;
							}

							const app = document.getElementById('header-section-page');
							const mergedJsonContentHeader = utilsModule.mergeJSON(projectConfigResponse, {
								customHeaderUrl: projectConfigModule.getCustomHeaderUrl()
							});
							app.innerHTML = utilsModule.replacePlaceHolders(dataHeader, mergedJsonContentHeader);

							let sidebarToggle = document.getElementById("sidebarToggle");
							if (projectConfigResponse.menuOrientation === "vertical") {
								if (sidebarToggle) {
									sidebarToggle.classList.remove("display-none");
								}
							} else {
								if (sidebarToggle) {
									if (!sidebarToggle.classList.contains("display-none")) {
										sidebarToggle.classList.add("display-none");
									}
								}
							}

							if (projectConfigResponse.header.$component === "") {
								const headerSectionPageSet1 = document.getElementById('header-section-page-set1');
								headerSectionPageSet1.innerHTML = utilsModule.replacePlaceHolders(document.getElementById("header-section-page-template1-set1").innerHTML, mergedJsonContentHeader);
							}
						} else {
							document.getElementById("header-index-page").remove();
						}

						// Content
						const appContent = document.getElementById('content-index-page');
						let data = "";
						if (projectConfigResponse.menuOrientation === "horizontal") {
							data = document.getElementById("template-content-page-section-horizontal").innerHTML;
						} else if (projectConfigResponse.menuOrientation === "vertical") {
							data = document.getElementById("template-content-page-section-vertical").innerHTML;
						} else {
							data = document.getElementById("template-content-page-section-none").innerHTML;
						}

						const mergedJsonContent = utilsModule.mergeJSON(projectConfigResponse, {});
						appContent.innerHTML += utilsModule.replacePlaceHolders(data, mergedJsonContent);

						const pagesList = projectConfigModule.getNavigationPages();
						pagesList.forEach(e => { if (e.preloadPage) { totalPreloadPage++; } })
						if (projectConfigResponse.menuOrientation === "horizontal") {
							document.getElementById("horizontal-menu-swiper-thumb")?.setAttribute("size", pagesList.length);
						} else if (projectConfigResponse.menuOrientation === "vertical") {
							document.getElementById("vertical-menu-swiper-thumb")?.setAttribute("size", pagesList.length);
						}

						let triggerviewInContent = "";
						if (projectConfigResponse.menuOrientation === "horizontal") {
							triggerviewInContent = document.getElementById("triggerviewInContentHorizontal");
						} else if (projectConfigResponse.menuOrientation === "vertical") {
							triggerviewInContent = document.getElementById("triggerviewInContentVertical");
						} else {
							triggerviewInContent = document.getElementById("triggerviewInContentNone");
						}
						if (triggerviewInContent) {
							const tgViewProperties = projectConfigResponse.content.triggerViewProperties;
							if (tgViewProperties) {
								Object.entries(tgViewProperties).forEach(([key, value]) => {
									triggerviewInContent.setAttribute(key, value);
								});
							}

							for (let i = 0; i < pagesList.length; i++) {
								const childNodeTriggerView = document.createElement("ch5-triggerview-child");
								const tgViewChildProperties = projectConfigResponse.content.pages[i].triggerViewChildProperties;
								if (tgViewChildProperties) {
									Object.entries(tgViewChildProperties).forEach(([key, value]) => {
										childNodeTriggerView.setAttribute(key, value);
									});
								}

								/*
								// LOADING INDICATOR - Uncomment the below lines along with code in navigation.js file to enable loading indicator
								const htmlImportSnippetForLoader = document.createElement("ch5-import-htmlsnippet");
								htmlImportSnippetForLoader.setAttribute("id", pagesList[i].pageName + "-import-page-app-loader");
								htmlImportSnippetForLoader.setAttribute("receiveStateShow", pagesList[i].pageName + "-import-page-show-app-loader");
								htmlImportSnippetForLoader.setAttribute("url", "./app/template/components/widgets/template-app-loader/template-app-loader.html");							
								*/

								const htmlImportSnippet = document.createElement("ch5-import-htmlsnippet");
								htmlImportSnippet.setAttribute("id", pagesList[i].pageName + "-import-page");

								/*
								preloadPage: FALSE + cachedPage: FALSE (Default setting)
									* page is not loaded on startup - load time is only during first time page is called
									* page is not cached - each time user comes to the page, the page is loaded, and unloaded when user leaves the page.
								preloadPage: FALSE + cachedPage: TRUE
									* page is not loaded on startup - load time is only during the time page is called. Since page is cached, load time is only for first time.
									* page is cached - load time is whenever the user opens the page. Each time user comes to the page, the page is available already and there is no page load time. Even after user leaves the page, the page is not removed from DOM and is always available. DOM weight for project is high because of this feature.
								preloadPage: TRUE + cachedPage: FALSE
									* page is loaded on startup - load time is during first time page is called
									* page is not cached - each time user comes to the page, the page is loaded, and unloaded when user leaves the page. However, since the page is loaded for first time, the page will not be removed from DOM unless user visits the page atleast once. Once the user visits the page, and leaves the page, the page is removed from DOM. After user leaves the page, the load time is during each page call again.
								preloadPage: TRUE + cachedPage: TRUE
									* page is loaded on startup - load time is during first time page is called
									* page is cached - load time is during the project load. Each time user comes to the page, the page is available already and there is no page load time. Even after user leaves the page, the page is not removed from DOM and is always available. DOM weight for project is high because of this feature.
								*/
								if (CrComLib.isCrestronTouchscreen()) {
									pageLoadTimeout = 15000;
								}

								if (pagesList[i].preloadPage === true) {
									// We need the below becos there is a flicker when page loads and hides if url is set - specifically with signal sent
									setTimeout(() => {
										htmlImportSnippet.setAttribute("url", pagesList[i].fullPath + pagesList[i].fileName);
										preloadPageLoaded++;
									}, pageLoadTimeout);
									htmlImportSnippet.setAttribute("noShowType", "display");
								} else {
									htmlImportSnippet.setAttribute("receiveStateShow", pagesList[i].pageName + "-import-page-show");
									if (pagesList[i].cachePage === true) {
										htmlImportSnippet.setAttribute("noShowType", "display");
									} else {
										htmlImportSnippet.setAttribute("noShowType", "remove");
									}
								}

								// LOADING INDICATOR - Uncomment the below line along with code in navigation.js file to enable loading indicator
								// childNodeTriggerView.appendChild(htmlImportSnippetForLoader);
								childNodeTriggerView.appendChild(htmlImportSnippet);
								triggerviewInContent.appendChild(childNodeTriggerView);
							}
							triggerviewInContent.setAttribute("activeview", projectConfigModule.defaultActiveViewIndex());
							triggerview = triggerviewInContent;
						}

						// Footer
						if (projectConfigResponse.footer.display === true) {
							const appFooter = document.getElementById('footer-section-page');
							let dataFooter = "";
							if (projectConfigResponse.footer.$component && projectConfigResponse.footer.$component !== "") {
								dataFooter = document.getElementById("footer-section-page-template2").innerHTML;
							} else {
								dataFooter = document.getElementById("footer-section-page-template1").innerHTML;
							}

							const mergedJsonContentFooter = utilsModule.mergeJSON(projectConfigResponse, {
								copyrightYear: (new Date()).getFullYear(),
								customFooterUrl: projectConfigModule.getCustomFooterUrl()
							});
							appFooter.innerHTML = utilsModule.replacePlaceHolders(dataFooter, mergedJsonContentFooter);
						} else {
							document.getElementById("footer-index-page").remove();
						}

						if (triggerview) {
							triggerview.addEventListener("select", (event) => {
								const listOfPages = projectConfigModule.getNavigationPages();
								if (listOfPages.length > 0 && event.detail !== undefined && listOfPages[event.detail].pageName !== selectedPage.pageName) {
									navigateTriggerViewByIndex(event.detail);
								}
							});
						}

						CrComLib.subscribeState('s', 'Csig.Product_Name_Text_Join_fb', (deviceSpecificData) => {
							hardButtonsModule.initialize(deviceSpecificData).then(() => {
								let responseArrayForNavPages = projectConfigModule.getNavigationPages();
								if (projectConfigResponse.menuOrientation === "horizontal") {
									let loadListCh5 = CrComLib.subscribeState('o', 'ch5-list', (value) => {
										if (value['loaded'] && (value['id'] === "horizontal-menu-swiper-thumb")) {
											loadCh5ListForMenu(projectConfigResponse, responseArrayForNavPages);
											navigateToFirstPage(projectConfigResponse, responseArrayForNavPages);
											setTimeout(() => {
												CrComLib.unsubscribeState('o', 'ch5-list', loadListCh5);
												loadListCh5 = null;
											});
										}
									});
								} else if (projectConfigResponse.menuOrientation === "vertical") {
									let loadListCh5 = CrComLib.subscribeState('o', 'ch5-list', (value) => {
										if (value['loaded'] && (value['id'] === "vertical-menu-swiper-thumb")) {
											loadCh5ListForMenu(projectConfigResponse, responseArrayForNavPages);
											navigateToFirstPage(projectConfigResponse, responseArrayForNavPages);
											setTimeout(() => {
												CrComLib.unsubscribeState('o', 'ch5-list', loadListCh5);
												loadListCh5 = null;
											});
										}
									});
								} else {
									navigateToFirstPage(projectConfigResponse, responseArrayForNavPages);
								}
								if (!deviceSpecificData) {
									configureWebXPanel(projectConfigResponse);
								}
							});
						});
						templateSetThemeModule.setThemes(projectConfigResponse.themes);
						templateSetThemeModule.changeTheme(projectConfigResponse.selectedTheme);
					});
				});
			});

			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-page-import-page', loadedSubId);
				loadedSubId = null;
			});
		}
	});


	function configureWebXPanel(projectConfigResponse) {
		const entries = webXPanelModule.paramsToObject();
		let isForceDeviceXPanel = projectConfigResponse.forceDeviceXPanel;
		if (entries["forcedevicexpanel"] === "true") {
			isForceDeviceXPanel = true;
		} else if (entries["forcedevicexpanel"] === "false") {
			isForceDeviceXPanel = false;
		}
		if (isForceDeviceXPanel === true) {
			webXPanelModule.getWebXPanel(true); // Always Connect as WebX and not Native
			connectToWebXPanel(projectConfigResponse);
		} else {
			// Check if Crestron Device
			if (WebXPanel.runsInContainerApp() === true) {
				webXPanelModule.getWebXPanel(false); // Connect as Native
				connectToWebXPanel(projectConfigResponse);
			} else {
				if (projectConfigResponse.useWebXPanel === true) {
					webXPanelModule.getWebXPanel(true);
					connectToWebXPanel(projectConfigResponse);
				}
			}
		}
	}

	function connectToWebXPanel(projectConfigResponse) {
		if (!isWebXPanelInitialized) {
			let loadListCh5 = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-version-info-import-page', (value) => {
				if (value['loaded']) {
					webXPanelModule.connect(projectConfigResponse);
					isWebXPanelInitialized = true;
					setTimeout(() => {
						CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-version-info-import-page', loadListCh5);
						loadListCh5 = null;
					});
				}
			});
		}
	}

	function loadCh5ListForMenu(projectConfigResponse, responseArrayForNavPages) {
		for (let i = 0; i < responseArrayForNavPages.length; i++) {
			const menu = document.getElementById("menu-list-id-" + i);
			if (menu) {
				if (responseArrayForNavPages[i].navigation.iconUrl && responseArrayForNavPages[i].navigation.iconUrl !== "") {
					menu.setAttribute("iconUrl", responseArrayForNavPages[i].navigation.iconUrl);
				} else if (responseArrayForNavPages[i].navigation.iconClass && responseArrayForNavPages[i].navigation.iconClass !== "") {
					menu.setAttribute("iconClass", responseArrayForNavPages[i].navigation.iconClass);
				}
				if (responseArrayForNavPages[i].navigation.isI18nLabel === true) {
					menu.setAttribute("label", translateModule.translateInstant(responseArrayForNavPages[i].navigation.label));
				} else {
					menu.setAttribute("label", responseArrayForNavPages[i].navigation.label);
				}
				menu.setAttribute("iconClass", responseArrayForNavPages[i].navigation.iconClass);
				if (projectConfigResponse.menuOrientation === 'horizontal') {
					menu.setAttribute("iconPosition", responseArrayForNavPages[i].navigation.iconPosition);
				}
				menu.setAttribute("receiveStateSelected", "active_state_class_" + responseArrayForNavPages[i].pageName);
				menu.setAttribute("onRelease", "templatePageModule.navigateTriggerViewByPageName('" + responseArrayForNavPages[i].pageName + "')");
			}
		}
	}

	function navigateToFirstPage(projectConfigResponse, responseArrayForNavPages) {
		let newIndex = -99;
		if (projectConfigResponse.content.$defaultView && projectConfigResponse.content.$defaultView !== "") {
			for (let i = 0; i < responseArrayForNavPages.length; i++) {
				if (responseArrayForNavPages[i].pageName.toString().trim().toUpperCase() === projectConfigResponse.content.$defaultView.toString().trim().toUpperCase()) {
					newIndex = i;
					break;
				} else {
					newIndex = -1;
				}
			}
		} else {
			newIndex = 0;
		}

		if (newIndex === -99 || newIndex === -1) {
			newIndex = 0;
		}
		navigateTriggerViewByIndex(newIndex);
	}

	/**
	 * Loader method is for spinner
	 */
	function hideLoading(pageObject) {
		if (totalPreloadPage === preloadPageLoaded) {
			if (!firstLoad && totalPreloadPage !== 0) {
				firstLoad = true;
				const listOfPages = projectConfigModule.getNavigationPages();
				listOfPages.forEach((page) => page.preloadPage && navigationModule.updateDiagnosticsOnPageChange(page.pageName));
			}
			cleanup();
			if (document.getElementById("loader").style.display === "none") {
				setTimeout(() => {
					document.getElementById("loader").style.display = "none";
					CrComLib.publishEvent('o', 'appLoad', { 'loaded': true });
				}, 2000);
			} else {
				const newPageTest = pageObject.pageName + "-import-page";
				setTimeout(() => {
					document.getElementById(newPageTest).classList.add("ch5-hide-dis");
					setTimeout(() => {
						document.getElementById(newPageTest).classList.remove("ch5-hide-dis");
						setTimeout(() => {
							document.getElementById("loader").style.display = "none";
							CrComLib.publishEvent('o', 'appLoad', { 'loaded': true });
							if (webXPanelModule.isAuthTokenValid()) {
								document.getElementById('authtoken-alert').setAttribute('show', 'true');
							}
						}, 2000);
					}, 1000);
				}, 1000);
			}
		} else {
			setTimeout(() => {
				hideLoading(pageObject);
			}, 500);
		}
	}

	function cleanup() {
		document.getElementById("header-section-page-template1")?.remove();
		document.getElementById("header-section-page-template2")?.remove();
		document.getElementById("template-content-page-section-horizontal")?.remove();
		document.getElementById("template-content-page-section-vertical")?.remove();
		document.getElementById("template-content-page-section-none")?.remove();
		document.getElementById("footer-section-page-template1")?.remove();
		document.getElementById("footer-section-page-template2")?.remove();
		document.getElementById("header-section-page-template1-set1")?.remove();

		projectConfigModule.projectConfigData().then(data => {
			if (data.header.displayInfo === false) {
				document.getElementById('logsbtn')?.remove();
			}
			if (data.header.displayInfo === false) {
				document.getElementById('infobtn')?.remove();
			}
			if (data.header.displayTheme === false) {
				document.getElementById('themebtn')?.remove();
			}
			if (data.menuOrientation === "vertical" || data.menuOrientation === "none") {
				document.getElementById('template-content-index-footer')?.remove();
			}
		});
	}

	window.addEventListener("orientationchange", function () {
		try {
			templatePageModule.setMenuActive();
		} catch (e) {
			// console.log(e);
		}
	}, false);

	/**
	 * Exported public method and properties
	 */
	return {
		navigateTriggerViewByPageName,
		openThumbNav,
		toggleSidebar,
		hideLoading,
		navigateTriggerViewByIndex
	};

})();
