// import { expect } from 'chai';
// import * as sinon from "sinon";
// import mock from 'mock-fs';
// import { Ch5CliLogger } from "../Ch5CliLogger";
// import { SinonStub } from "sinon";
// import { Ch5ValidateProjectConfigCli } from "./Ch5ValidateProjectConfigJsonCli";

// const validateProjectComponent = new Ch5ValidateProjectConfigCli();

// describe('Validate project config >>>>>>>> ', () => {
//     let loggerPrintErrorStub: SinonStub;
//     let loggerPrintSuccessStub: SinonStub;
//     let loggerPrintWarningStub: SinonStub;

//     beforeEach(() => {
//         loggerPrintErrorStub = sinon.stub(Ch5CliLogger.prototype, 'printError');
//         loggerPrintSuccessStub = sinon.stub(Ch5CliLogger.prototype, 'printSuccess');
//         sinon.stub(Ch5CliLogger.prototype, 'printLog');
//         loggerPrintWarningStub = sinon.stub(Ch5CliLogger.prototype, 'printWarning');
//     });

//     after(() => {
//         mock.restore();
//     });

//     afterEach(() => {
//         // Revert any stubs / mocks created using sinon
//         sinon.restore();
//     });

//     it('Validate valid json - incorrect folder structure', async () => {
//         mock({
//             '.vscode': {
//                 'project-config-schema.json': JSON.stringify(projectConfigSchema)
//             },
//             'app': {
//                 'project-config.json': JSON.stringify(validAppJson),
//             }
//         });
//         const response = await validateProjectComponent.run();
//         expect(loggerPrintSuccessStub.called).to.equal(false);
//         expect(loggerPrintErrorStub.called).to.equal(true);
//         expect(response).equals(false);
//     });

//     it('Validate valid json - correct folder structure', async () => {
//         mock({
//             '.vscode': {
//                 'project-config-schema.json': JSON.stringify(projectConfigSchema)
//             },
//             'app': {
//                 'project-config.json': JSON.stringify(validAppJson),
//                 'project': fileProject
//             }
//         });
//         const response = await validateProjectComponent.run();
//         expect(response).to.equal(true);
//     });

//     it('Validate valid json - missing pages from file system', async () => {
//         mock({
//             '.vscode': {
//                 'project-config-schema.json': JSON.stringify(projectConfigSchema)
//             },
//             'app': {
//                 'project-config.json': JSON.stringify(validAppJson),
//                 'project': fileProjectMissingPage
//             }
//         });
//         const response = await validateProjectComponent.run();
//         expect(response).to.equal(false);
//     });

//     it('Validate valid json - missing widgets from file system', async () => {
//         mock({
//             '.vscode': {
//                 'project-config-schema.json': JSON.stringify(projectConfigSchema)
//             },
//             'app': {
//                 'project-config.json': JSON.stringify(validAppJson),
//                 'project': fileProjectMissingWidget
//             }
//         });
//         const response = await validateProjectComponent.run();
//         expect(response).to.equal(false);
//     });

//     it('Validate invalid json - duplicate pages', async () => {
//         mock({
//             '.vscode': {
//                 'project-config-schema.json': JSON.stringify(projectConfigSchema)
//             },
//             'app': {
//                 'project-config.json': JSON.stringify(duplicatePagesAppJson),
//                 'project': fileProject
//             }
//         });
//         const response = await validateProjectComponent.run();
//         expect(loggerPrintWarningStub.called).equals(true);
//         expect(response).to.equal(false);
//     });

//     it('Validate invalid json - duplicate widgets', async () => {
//         mock({
//             '.vscode': {
//                 'project-config-schema.json': JSON.stringify(projectConfigSchema)
//             },
//             'app': {
//                 'project-config.json': JSON.stringify(duplicateWidgetsAppJson),
//                 'project': fileProject
//             }
//         });
//         const response = await validateProjectComponent.run();
//         expect(response).to.equal(false);
//     });
// });


// const projectConfigSchema = {
//     "$schema": "http://json-schema.org/draft-07/schema",
//     "definitions": {
//         "commonAttributes": {
//             "type": "object",
//             "properties": {
//                 "appendClassWhenInViewport": {
//                     "type": "string",
//                     "title": "appendClassWhenInViewport",
//                     "description": "This applies the provided value as a class name while the component is visible and removes the class name when the component is not visible."
//                 },
//                 "customClass": {
//                     "type": "string",
//                     "title": "customClass",
//                     "description": "The signal can contain one or more custom CSS classes separated by spaces.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "customStyle": {
//                     "type": "string",
//                     "title": "customStyle",
//                     "description": "The signal can contain a list of space-delimited style classes applied on the component.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "debug": {
//                     "type": "boolean",
//                     "title": "debug",
//                     "description": "The default value is false. Used to get useful developer-related information about component behavior."
//                 },
//                 "noShowType": {
//                     "type": "string",
//                     "title": "noShowType",
//                     "description": "This property reflects the type of the visibility of the item. See the 'data-ch5-noshow-type' custom HTML attribute for further information.",
//                     "enum": [
//                         "visibility",
//                         "display",
//                         "remove"
//                     ]
//                 },
//                 "role": {
//                     "type": "string",
//                     "title": "role",
//                     "description": "This is an accessibility attribute implemented by all ch5-components and added automatically if not set by the user. Where possible, it represents the closest supported type for a ch5-component. The default value for this ch5-component can be overridden via this property."
//                 },
//                 "receiveStateCustomClass": {
//                     "type": "string",
//                     "title": "receivestatecustomclass",
//                     "description": "The value of this signal will be applied as an equivalent property on 'customClass'. This change will remove the prior value and apply the new value.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "receiveStateCustomStyle": {
//                     "type": "string",
//                     "title": "receivestatecustomstyle",
//                     "description": "The value of this signal will be applied as an equivalent property on 'styleClass'. This change will remove the prior value and apply the new value.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "receiveStateEnable": {
//                     "type": "string",
//                     "title": "receivestateenable",
//                     "description": "When true, the Boolean value of the signal determines if the component is enabled. Note that the signal name is provided, and the value of the signal has the opposite convention of the 'disabled' attribute. This is to provide consistency with current programming practices.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "receiveStateShow": {
//                     "type": "string",
//                     "title": "receivestateshow",
//                     "description": "When true, the Boolean value of the signal determines if the component is visible.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "receiveStateShowPulse": {
//                     "type": "string",
//                     "title": "receivestateshowpulse",
//                     "description": "On transition from false to true, this signal directs the component to become visible.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "receiveStateHidePulse": {
//                     "type": "string",
//                     "title": "receivestatehidepulse",
//                     "description": "On transition from false to true, this signal will direct if the component is no longer visible.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "sendEventOnShow": {
//                     "type": "string",
//                     "title": "sendeventonshow",
//                     "description": "This has a Boolean value of true when the component is visible and false when not visible. Note that even if component is completely covered by other visible elements, it is still considered visible.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-show": {
//                     "type": "string",
//                     "title": "data-ch5-show",
//                     "description": "Specifies whether or not an element is visible based upon the value of the state. Works with standard HTML elements. The data-ch5-noshow-type attribute can be supplied to set how an HTML element will be hidden from view.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-noshow-type": {
//                     "type": "string",
//                     "title": "data-ch5-noshow-type",
//                     "description": "The 'data-ch5-noshow-type' custom attribute is related to the HTML custom attribute 'data-ch5-show' and overrides the way in which a Component is made invisible. The Crestron Components library will default the 'noshow' type based upon the element type.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-appendclass": {
//                     "type": "string",
//                     "title": "data-ch5-appendclass",
//                     "description": "The 'data-ch5-appendclass' custom HTML attribute appends the value of a signal to the 'class' attribute on a standard HTML element. A change in signal value will remove the prior value of the signal and append the new value.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-innerhtml": {
//                     "type": "string",
//                     "title": "data-ch5-innerhtml",
//                     "description": "The 'data-ch5-innerhtml' custom HTML attribute allows for dynamic HTML content to be applied to standard HTML elements such as <div>. This is a very powerful construct that, when used incorrecly, can lead to functional and performance issues if used to inject badly-formed HTML. The attribute value is signalScript as described in the ch5.subscribeStateScript utility function description.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-showpulse": {
//                     "type": "string",
//                     "title": "data-ch5-showpulse",
//                     "description": "Works similarly to data-ch5-show, but does not offer toggle functionality (can only make the elements visible). Works with standard HTML elements. The data-ch5-noshow-type attribute can be supplied to set how an HTML element will be hidden from view.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-textcontent": {
//                     "type": "string",
//                     "title": "data-ch5-textcontent",
//                     "description": "The 'data-ch5-textcontent' custom HTML attribute allows for dynamic text content to be applied to standard HTML elements such as <p> and <h1-6>. The attribute value is signalScript as described in the ch5.subscribeStateScript utility function description.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-appendstyle": {
//                     "type": "string",
//                     "title": "data-ch5-appendstyle",
//                     "description": "The 'data-ch5-appendstyle' custom HTML attribute appends the value of a signal to the 'style' attribute on a standard HTML element. A signal value change will remove the prior value of the signal and append the new value.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-hidepulse": {
//                     "type": "string",
//                     "title": "data-ch5-hidepulse",
//                     "description": "Works similarly to data-ch5-show, but does not offer toggle functionality (can only hide the elements). Works with standard HTML elements. The data-ch5-noshow-type attribute can be supplied to set how an HTML element will be hidden from view.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-keep-sig-subscription": {
//                     "type": "string",
//                     "title": "data-ch5-keep-sig-subscription",
//                     "description": "Keeps the state subscription key generated by hidepulse, showpulse, or show custom attributes.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 },
//                 "data-ch5-i18n": {
//                     "type": "string",
//                     "title": "data-ch5-i18n",
//                     "description": "The 'data-ch5-i18n' custom HTML attribute allows for text content translation to be applied to standard HTML elements.",
//                     "pattern": "^[a-zA-Z0-9_]{1,100}$"
//                 }
//             }
//         }
//     },
//     "default": {},
//     "type": "object",
//     "title": "Project Configuration",
//     "description": "This document is used to configure the themes, content, and navigation in the project. Any pages or widgets can be added or removed via the project configuration.",
//     "required": [
//         "projectName",
//         "version",
//         "faviconPath",
//         "menuOrientation",
//         "selectedTheme",
//         "useWebXPanel",
//         "themes",
//         "header",
//         "content",
//         "footer"
//     ],
//     "properties": {
//         "projectName": {
//             "title": "Project Name",
//             "description": "A meaningful short name for the project.",
//             "type": "string"
//         },
//         "version": {
//             "default": "0.0.1",
//             "title": "Version",
//             "description": "The version of the project configuration.",
//             "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
//             "type": "string"
//         },
//         "faviconPath": {
//             "default": "",
//             "title": "favicon",
//             "description": "A well-designed favicon to match the logo or theme of your project. The preferred format for favicon icon is '.ico' and preferred sizes are 16x16, 32x32 or 48x48.",
//             "type": "string",
//             "pattern": "^[^\\s]+$"
//         },
//         "menuOrientation": {
//             "default": "horizontal",
//             "title": "Menu Orientation",
//             "description": "The type of navigation menu to display in the layout. The 'horizontal' menu displays navigation items in the footer, the 'vertical' menu has a toggle icon in the header bar and option 'none' will not display any navigation menu. In the configuration, the header display value should not be set to false when you set menuOrientation as 'vertical'.",
//             "enum": [
//                 "horizontal",
//                 "vertical",
//                 "none"
//             ],
//             "type": "string"
//         },
//         "selectedTheme": {
//             "title": "Default Theme Name",
//             "description": "The default CH5 theme to be applied for the project. The theme name should match with one of the names in the themes configuration array.",
//             "type": "string"
//         },
//         "useWebXPanel": {
//             "default": false,
//             "description": "Use WebXPanel in the CH5 Project to connect with the CS.",
//             "title": "Use WebXPanel"
//         },
//         "themes": {
//             "default": [],
//             "description": "A list of CH5 themes that are used in the project.",
//             "title": "CH5 Themes List",
//             "additionalItems": false,
//             "items": {
//                 "anyOf": [
//                     {
//                         "default": {},
//                         "description": "An item from the themes list.",
//                         "required": [
//                             "name",
//                             "path"
//                         ],
//                         "title": "Theme item",
//                         "properties": {
//                             "name": {
//                                 "description": "A theme name for your styles.",
//                                 "title": "Theme Name",
//                                 "type": "string"
//                             },
//                             "path": {
//                                 "description": "A valid local CSS path for your theme.",
//                                 "title": "Theme Path",
//                                 "type": "string"
//                             },
//                             "brandLogo": {
//                                 "$id": "#/properties/themes/items/anyOf/0/properties/brandLogo",
//                                 "type": "object",
//                                 "title": "Brand Logo",
//                                 "description": "The url path for the logo. Supports web image formats. The logo can match your selected theme color.",
//                                 "required": [
//                                     "url"
//                                 ],
//                                 "examples": [
//                                     {
//                                         "url": "",
//                                         "alt": "Logo",
//                                         "receiveStateUrl": ""
//                                     }
//                                 ],
//                                 "properties": {
//                                     "url": {
//                                         "$id": "#/properties/themes/items/anyOf/0/properties/brandLogo/properties/url",
//                                         "type": "string",
//                                         "title": "Image URL",
//                                         "description": "The path to the brand logo image.",
//                                         "pattern": "^(.*?(svg|gif|png|jpe|jpg|jpeg|jfif))$"
//                                     },
//                                     "alt": {
//                                         "$id": "#/properties/themes/items/anyOf/0/properties/brandLogo/properties/alt",
//                                         "type": "string",
//                                         "title": "Alt text for an Image",
//                                         "description": "Specifies alternate text for the image, if the image for some reason cannot be displayed."
//                                     },
//                                     "receiveStateUrl": {
//                                         "$id": "#/properties/themes/items/anyOf/0/properties/brandLogo/properties/receiveStateUrl",
//                                         "type": "string",
//                                         "title": "receiveStateUrl",
//                                         "description": "The value of this signal, when defined, will set the url attribute."
//                                     }
//                                 },
//                                 "additionalProperties": false
//                             },
//                             "backgroundProperties": {
//                                 "default": {},
//                                 "description": "This object contains ch5-background properties.",
//                                 "examples": [
//                                     {
//                                         "url": [],
//                                         "backgroundColor": [],
//                                         "repeat": "",
//                                         "scale": "",
//                                         "refreshRate": 0,
//                                         "imgBackgroundColor": "",
//                                         "transitionEffect": "",
//                                         "transitionDuration": "",
//                                         "receiveStateUrl": "",
//                                         "receiveStateBackgroundColor": "",
//                                         "receiveStateRefreshRate": ""
//                                     }
//                                 ],
//                                 "title": "ch5-background Properties",
//                                 "properties": {
//                                     "url": {
//                                         "type": "array",
//                                         "uniqueItems": true,
//                                         "description": "One or more image URLs will be used as the background. Supported image types include JPEG, PNG, SVG, and BMP. Animated GIFs are not supported. Multiple URLs can be provided when separated by | (vertical bar) to have images cycle over time.",
//                                         "title": "ch5-background URL",
//                                         "additionalItems": false,
//                                         "items": {
//                                             "$id": "#/properties/themes/items/anyOf/0/properties/.backgroundProperties/properties/url/items",
//                                             "anyOf": [
//                                                 {}
//                                             ]
//                                         }
//                                     },
//                                     "backgroundColor": {
//                                         "type": "array",
//                                         "uniqueItems": true,
//                                         "description": "Use when one or more background colors will be used via the CSS background-color property syntax, including color names, #hex codes, rgb(), rgba(), hsl() and hsla(). Multiple colors can be provided separated by a | (vertical bar) to have colors cycle based on the time defined. A black color will be used for invalid input. This attribute is superseded by the url attribute.",
//                                         "title": "Background Color",
//                                         "additionalItems": false,
//                                         "items": {
//                                             "$id": "#/properties/themes/items/anyOf/0/properties/.backgroundProperties/properties/backgroundColor/items"
//                                         }
//                                     },
//                                     "repeat": {
//                                         "default": "no-repeat",
//                                         "type": "string",
//                                         "description": "The repeat property sets how a background image will be repeated. In the absence of the repeat attribute, 'no-repeat' will be applied by default. Valid values: 'no-repeat', 'repeat-x', 'repeat-y', and 'repeat'. The value 'repeat-x' repeats image horizontally, 'repeat-y' repeats the image vertically, and 'repeat' repeats both vertically and horizontally. The last image will be clipped if it does not fit.",
//                                         "enum": [
//                                             "no-repeat",
//                                             "repeat",
//                                             "repeat-x",
//                                             "repeat-y"
//                                         ],
//                                         "title": "Repeat Property"
//                                     },
//                                     "scale": {
//                                         "default": "stretch",
//                                         "type": "string",
//                                         "title": "Scale Property",
//                                         "description": "The default value is 'stretch'. Valid values: 'stretch', 'fill', 'fit'. Defines how an image will fill the component when the component and the image do not have the same aspect ratio. 'stretch' will transform the image to have the same aspect ratio as the component, 'fill' will size the image to leave no extra space but will crop off either the top and bottom or left and right to fill the component completely, and 'fit' will preserve the image aspect ratio by centering the image and leaving either a letter box on the top and bottom or a pillar box on the left and right.",
//                                         "enum": [
//                                             "stretch",
//                                             "fill",
//                                             "fit"
//                                         ]
//                                     },
//                                     "refreshRate": {
//                                         "default": 600,
//                                         "type": "integer",
//                                         "description": "The default value is 600. The minimum value is 10 and maximum value is 604800. When more than one image is provided in the url attribute, this attribute provides the duration in seconds that each image will be displayed. Values outside of the min and max will be capped at the closest valid value.",
//                                         "title": "Refresh Rate Property",
//                                         "maximum": 604800,
//                                         "minimum": 10,
//                                         "messages": {
//                                             "minimum": "Min Value must 10"
//                                         }
//                                     },
//                                     "imgBackgroundColor": {
//                                         "default": "black",
//                                         "type": "string",
//                                         "description": "The default value is 'black'. This is related to the scale attribute having a value of 'fit'. This attribute defines the color of the pillar box or letter box borders when the image aspect ratio is not the same as the component aspect ratio.",
//                                         "title": "imgBackgroundColor Property"
//                                     },
//                                     "transitionEffect": {
//                                         "default": "ease",
//                                         "type": "string",
//                                         "description": "The default value is 'ease'. When more than one image or color is provided in the url or backgroundcolor attributes, this attribute provide the type of transition using the CSS transition-timing-syntax property syntax. See the related attribute transition-duration.",
//                                         "title": "transitionEffect Property"
//                                     },
//                                     "transitionDuration": {
//                                         "default": "1s",
//                                         "type": "string",
//                                         "description": "The default value is '1s'. When more than one image or color is provided in url or backgroundcolor attribute, this attribute provides the duration of the transition using CSS transition-duration syntax.",
//                                         "title": "transitionDuration property",
//                                         "pattern": "^[0-9]+s$"
//                                     },
//                                     "receiveStateUrl": {
//                                         "type": "string",
//                                         "title": "receiveStateUrl property",
//                                         "description": "The value of this signal, when defined, will set the url attribute. This attribute takes precedence over backgroundcolor, url, and receiveStateBackgroundColor attributes."
//                                     },
//                                     "receiveStateBackgroundColor": {
//                                         "type": "string",
//                                         "description": "The value of this signal, when defined, will set the backgroundColor attribute. This attribute is superseded by the receivestateurl attribute.",
//                                         "title": "receiveStateBackgroundColor property"
//                                     },
//                                     "receiveStateRefreshRate": {
//                                         "type": "string",
//                                         "description": "The value of this signal, when defined, will set the refreshRate attribute.",
//                                         "title": "receiveStateRefreshRate property"
//                                     }
//                                 },
//                                 "additionalProperties": false
//                             }
//                         },
//                         "additionalProperties": false
//                     }
//                 ]
//             }
//         },
//         "config": {
//             "$id": "#/properties/config",
//             "type": "object",
//             "title": "Config",
//             "description": "The configuration information of the Control System.",
//             "default": {
//                 "controlSystem": {
//                     "host": "",
//                     "port": 49200,
//                     "roomId": "",
//                     "ipId": "",
//                     "tokenSource": "",
//                     "tokenUrl": "",
//                     "licenseExpirationWarning": 60
//                 }
//             },
//             "properties": {
//                 "controlSystem": {
//                     "default": {
//                         "host": "",
//                         "port": 49200,
//                         "roomId": "",
//                         "ipId": "",
//                         "tokenSource": "",
//                         "tokenUrl": "",
//                         "licenseExpirationWarning": 60
//                     },
//                     "description": "The details of Control system to connect.",
//                     "title": "ControlSystem",
//                     "properties": {
//                         "host": {
//                             "default": "",
//                             "type": "string",
//                             "description": "Processor hostname or address.",
//                             "title": "host",
//                             "pattern": "^(?!\\s*$).+"
//                         },
//                         "port": {
//                             "default": 49200,
//                             "type": "integer",
//                             "title": "port",
//                             "description": "Processor port.",
//                             "minimum": 1,
//                             "maximum": 64000
//                         },
//                         "roomId": {
//                             "default": "",
//                             "type": "string",
//                             "description": "The Room Id",
//                             "title": "roomId",
//                             "pattern": "^(?!\\s*$).+"
//                         },
//                         "ipId": {
//                             "default": "",
//                             "type": "string",
//                             "description": "IP table identifier. Developers and end users should reference IP id as a hexadecimal value. It should not be interpreted as base 10 valuse, it should only be interpreted as hexadecimal value.",
//                             "title": "ipId",
//                             "pattern": "^(?!\\s*$).+"
//                         },
//                         "tokenUrl": {
//                             "default": "",
//                             "type": "string",
//                             "title": "tokenUrl",
//                             "description": "URL to identity provider REST API that provides security token to allow access to the control system.",
//                             "pattern": "^(?!\\s*$).+"
//                         },
//                         "tokenSource": {
//                             "default": "",
//                             "type": "string",
//                             "title": "tokenSource",
//                             "description": "Crestron provided code of the identity provider that provides security token",
//                             "pattern": "^(?!\\s*$).+"
//                         },
//                         "licenseExpirationWarning": {
//                             "default": 60,
//                             "type": "integer",
//                             "title": "licenseExpirationWarning",
//                             "description": "Show a warning that a license will expire a set number of days prior to expiration. Set to 0 to avoid showing a warning. The default value is 60 days."
//                         }
//                     },
//                     "additionalProperties": false
//                 }
//             },
//             "additionalProperties": false
//         },
//         "header": {
//             "$id": "#/properties/header",
//             "default": {},
//             "description": "The header bar for the layout can be configured here.",
//             "required": [
//                 "display",
//                 "displayInfo",
//                 "$component"
//             ],
//             "title": "Layout Header Bar",
//             "properties": {
//                 "display": {
//                     "$id": "#/properties/header/properties/display",
//                     "default": true,
//                     "type": "boolean",
//                     "description": "Shows or hides the header bar.",
//                     "title": "Display Property"
//                 },
//                 "displayInfo": {
//                     "$id": "#/properties/header/properties/displayInfo",
//                     "default": true,
//                     "type": "boolean",
//                     "description": "Shows or hides the information icon on the header bar. The displayInfo is only applicable when the display is set to true.\nNOTE: Not applicable for custom template.",
//                     "title": "displayInfo Property"
//                 },
//                 "$component": {
//                     "$id": "#/properties/header/properties/$component",
//                     "default": "",
//                     "type": "string",
//                     "title": "Component reference",
//                     "description": "$component refers to a pageName from the pages array. This page should not have a navigation menu, and the standAloneView property of the page should be set to true."
//                 }
//             },
//             "additionalProperties": false
//         },
//         "footer": {
//             "$id": "#/properties/footer/properties/%24component",
//             "default": {
//                 "display": false,
//                 "$component": "#footer"
//             },
//             "description": "The footer bar for the layout can be configured here.",
//             "required": [
//                 "display",
//                 "$component"
//             ],
//             "title": "Layout Footer Bar",
//             "properties": {
//                 "display": {
//                     "default": false,
//                     "type": "boolean",
//                     "description": "Shows or hides the footer bar.",
//                     "title": "Display Property"
//                 },
//                 "$component": {
//                     "type": "string",
//                     "description": "$component refers to a pageName from the pages array. This page should not have a navigation menu, and the standAloneView property of the page should be set to true.",
//                     "title": "Custom footer"
//                 }
//             },
//             "additionalProperties": false
//         },
//         "content": {
//             "default": {},
//             "description": "The content area consists of pages and widgets.",
//             "required": [
//                 "$defaultView",
//                 "pages"
//             ],
//             "title": "Content Information",
//             "properties": {
//                 "$defaultView": {
//                     "type": "string",
//                     "description": "The $defaultView refers to a pageName from the pages array. The standAloneView property of the page should be false.",
//                     "title": "$defaultView"
//                 },
//                 "triggerViewProperties": {
//                     "default": {},
//                     "title": "triggerViewProperties",
//                     "description": "The properties, send and receive states for triggerview can be set here.",
//                     "anyOf": [
//                         {
//                             "$ref": "#/definitions/commonAttributes"
//                         },
//                         {
//                             "properties": {
//                                 "gestureable": {
//                                     "type": "boolean",
//                                     "title": "gestureable",
//                                     "description": "The default value is false. When set to true, gesturing will be supported. Adding this will change the behavior inside of the component. Refer to Gesture - Use Cases for more information."
//                                 },
//                                 "endless": {
//                                     "type": "boolean",
//                                     "title": "endless",
//                                     "description": "The default value is false. The nextChildView method can be called on the last ChildView to open the first-child."
//                                 },
//                                 "sendeventshowchildindex": {
//                                     "type": "string",
//                                     "title": "sendeventshowchildindex",
//                                     "description": "Sends the numeric value of the currently visible state, based on 0-based numbering."
//                                 },
//                                 "receivestateshowchildindex": {
//                                     "type": "string",
//                                     "title": "receivestateshowchildindex",
//                                     "description": "The receipt of the numeric value of this state will make the 0-based index of views in the component become visible."
//                                 },
//                                 "disableAnimation": {
//                                     "default": false,
//                                     "type": "boolean",
//                                     "title": "disableAnimation",
//                                     "description": "The default value is false. When set to true. This will enable or disable the animation for the pages."
//                                 }
//                             }
//                         }
//                     ],
//                     "additionalProperties": true
//                 },
//                 "pages": {
//                     "default": [],
//                     "title": "Pages List",
//                     "description": "The pages are loaded as a triggerView child. If navigation is used, then the menu item will be displayed as per the menu orientation.",
//                     "additionalItems": false,
//                     "items": {
//                         "anyOf": [
//                             {
//                                 "default": {},
//                                 "title": "Page Item",
//                                 "description": "This consists of the page item.",
//                                 "examples": [
//                                     {
//                                         "pageName": "page1",
//                                         "fullPath": "./app/project/components/pages/page1/",
//                                         "fileName": "page1.html",
//                                         "triggerViewChildProperties": {
//                                             "sendeventonshow": ""
//                                         },
//                                         "pageProperties": {
//                                             "sendEventOnShow": ""
//                                         },
//                                         "navigation": {
//                                             "sequence": 1,
//                                             "label": "page1",
//                                             "isI18nLabel": false,
//                                             "iconClass": "",
//                                             "iconUrl": "./app/project/assets/img/navigation/ok.svg",
//                                             "iconPosition": "bottom"
//                                         }
//                                     }
//                                 ],
//                                 "required": [
//                                     "pageName",
//                                     "fullPath",
//                                     "fileName",
//                                     "standAloneView"
//                                 ],
//                                 "properties": {
//                                     "pageName": {
//                                         "type": "string",
//                                         "title": "Page Name",
//                                         "description": "A page name for the HTML page.",
//                                         "pattern": "^[a-zA-Z][a-zA-Z0-9-_$]*$"
//                                     },
//                                     "fullPath": {
//                                         "type": "string",
//                                         "title": "fullPath",
//                                         "description": "The full path of the HTML page.",
//                                         "examples": [
//                                             "./app/project/components/pages/page1/"
//                                         ]
//                                     },
//                                     "fileName": {
//                                         "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/fileName",
//                                         "type": "string",
//                                         "title": "fileName",
//                                         "description": "The filename of the HTML page.",
//                                         "pattern": "\\.html$"
//                                     },
//                                     "standAloneView": {
//                                         "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/standAloneView",
//                                         "type": "boolean",
//                                         "title": "standAloneView",
//                                         "default": false,
//                                         "description": "The standAloneView pages will not be a part of the triggerview content (slide). The navigation node takes preference over standAloneView when it is specified for the page.\nThere are two instances where the standAloneView does not contain a navigation node:\n1. When standAloneView is set to false.\n* The pages will not be a part of the content triggerview (slide).\n* These pages can be used to include specific HTML content as required (for example, Header and Footer).\n\r2. When standAloneView is set to true.\n* The pages will not be a part of the content triggerview (slide).\n* This page will be automatically added as ch5-import-htmlsnippet in the index.html page.\n* These pages can be used for full screen pop-ups or page loading views.\n"
//                                     },
//                                     "pageProperties": {
//                                         "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/pageProperties",
//                                         "default": {},
//                                         "type": "object",
//                                         "title": "pageProperties",
//                                         "description": "The properties of the HTML page snippet.",
//                                         "properties": {
//                                             "sendEventOnShow": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/pageProperties/properties/sendEventOnShow",
//                                                 "type": "string",
//                                                 "title": "sendEventOnShow",
//                                                 "description": "sendEventOnShow for the page."
//                                             }
//                                         },
//                                         "additionalProperties": true
//                                     },
//                                     "triggerViewChildProperties": {
//                                         "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/triggerViewChildProperties",
//                                         "type": "object",
//                                         "title": "ch5-triggerview Child properties",
//                                         "description": "The properties, receive and send states of ch5 triggerview child.",
//                                         "default": {},
//                                         "examples": [
//                                             {
//                                                 "sendeventonshow": "",
//                                                 "receivestatecustomclass": "",
//                                                 "receivestatecustomstyle": "",
//                                                 "receivestateshow": "",
//                                                 "receivestateshowpulse": "",
//                                                 "receivestatehidepulse": "",
//                                                 "receivestateenable": ""
//                                             }
//                                         ],
//                                         "anyOf": [
//                                             {
//                                                 "$ref": "#/definitions/commonAttributes"
//                                             }
//                                         ],
//                                         "additionalProperties": true
//                                     },
//                                     "navigation": {
//                                         "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation",
//                                         "type": "object",
//                                         "title": "Navigation Menu",
//                                         "description": "The navigation menu items.",
//                                         "default": {},
//                                         "examples": [
//                                             {
//                                                 "sequence": 1,
//                                                 "label": "page1",
//                                                 "isI18nLabel": false,
//                                                 "iconClass": "",
//                                                 "iconUrl": "./app/project/assets/img/navigation/ok.svg",
//                                                 "iconPosition": "bottom"
//                                             }
//                                         ],
//                                         "required": [
//                                             "sequence",
//                                             "label",
//                                             "isI18nLabel"
//                                         ],
//                                         "properties": {
//                                             "sequence": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation/properties/sequence",
//                                                 "type": "integer",
//                                                 "title": "Navigation Sequence",
//                                                 "description": "The navigation sequence of the menu items that are displayed.",
//                                                 "default": 0,
//                                                 "examples": [
//                                                     1
//                                                 ]
//                                             },
//                                             "label": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation/properties/label",
//                                                 "type": "string",
//                                                 "title": "label",
//                                                 "description": "The label for the navigation menu item."
//                                             },
//                                             "isI18nLabel": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation/properties/isI18nLabel",
//                                                 "type": "boolean",
//                                                 "title": "isI18nLabel",
//                                                 "description": "This flag indicates if the label has to be fetched from the user defined i18n language file."
//                                             },
//                                             "iconClass": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation/properties/iconClass",
//                                                 "type": "string",
//                                                 "title": "Icon Class",
//                                                 "description": "The icon class for the navigation menu item."
//                                             },
//                                             "iconUrl": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation/properties/iconUrl",
//                                                 "type": "string",
//                                                 "title": "Icon URL",
//                                                 "description": "The icon URL for the navigation menu item."
//                                             },
//                                             "iconPosition": {
//                                                 "$id": "#/properties/content/properties/pages/items/anyOf/0/properties/navigation/properties/iconPosition",
//                                                 "type": "string",
//                                                 "title": "Icon Position",
//                                                 "description": "The icon position for the navigation menu item.",
//                                                 "enum": [
//                                                     "",
//                                                     "first",
//                                                     "last",
//                                                     "top",
//                                                     "bottom"
//                                                 ]
//                                             }
//                                         },
//                                         "additionalProperties": false
//                                     }
//                                 },
//                                 "additionalProperties": false
//                             }
//                         ]
//                     }
//                 },
//                 "widgets": {
//                     "$id": "#/properties/content/properties/widgets",
//                     "type": "array",
//                     "title": "Widgets Schema",
//                     "description": "The schema for widgets used on the page.",
//                     "default": [],
//                     "examples": [
//                         [
//                             {
//                                 "widgetName": "pagedisplay",
//                                 "fullPath": "./app/project/components/widgets/pagedisplay/",
//                                 "fileName": "pagedisplay.html"
//                             }
//                         ]
//                     ],
//                     "additionalItems": false,
//                     "items": {
//                         "$id": "#/properties/content/properties/widgets/items",
//                         "anyOf": [
//                             {
//                                 "$id": "#/properties/content/properties/widgets/items/anyOf/0",
//                                 "type": "object",
//                                 "default": {},
//                                 "examples": [
//                                     {
//                                         "widgetName": "",
//                                         "fullPath": "",
//                                         "fileName": ""
//                                     }
//                                 ],
//                                 "required": [
//                                     "widgetName",
//                                     "fullPath",
//                                     "fileName"
//                                 ],
//                                 "properties": {
//                                     "widgetName": {
//                                         "default": "",
//                                         "description": "A name for the widget.",
//                                         "title": "widgetName",
//                                         "pattern": "^[a-zA-Z][a-zA-Z0-9-_$]*$"
//                                     },
//                                     "fullPath": {
//                                         "description": "Adds a full path for the widget.",
//                                         "pattern": "/$",
//                                         "title": "fullPath of the Widget"
//                                     },
//                                     "fileName": {
//                                         "description": "The filename of the widget.",
//                                         "title": "fileName",
//                                         "pattern": "\\.html$"
//                                     },
//                                     "widgetProperties": {
//                                         "title": "widgetProperties",
//                                         "description": "The properties, send and receive states for widget can be set here.",
//                                         "anyOf": [
//                                             {
//                                                 "$ref": "#/definitions/commonAttributes"
//                                             }
//                                         ],
//                                         "additionalProperties": true
//                                     }
//                                 },
//                                 "additionalProperties": false
//                             }
//                         ]
//                     }
//                 }
//             },
//             "additionalProperties": false
//         }
//     },
//     "additionalProperties": false
// };
// const fileProject = {
//     'components': {
//         'pages': {
//             'page1': {
//                 'page1.html': '',
//                 'page1.js': '',
//                 'page1.scss': '',
//                 'page1-emulator.json': ''
//             }
//         },
//         'widgets': {
//             'pagedisplay': {
//                 'pagedisplay.html': '',
//                 'pagedisplay.js': '',
//                 'pagedisplay.scss': '',
//                 'pagedisplay-emulator.json': ''
//             }
//         }
//     },
// };
// const fileProjectMissingPage = {
//     'components': {
//         'pages': {
//             'page2': {
//                 'page2.html': '',
//                 'page2.js': '',
//                 'page2.scss': '',
//                 'page2-emulator.json': ''
//             }
//         },
//         'widgets': {
//             'pagedisplay': {
//                 'pagedisplay.html': '',
//                 'pagedisplay.js': '',
//                 'pagedisplay.scss': '',
//                 'pagedisplay-emulator.json': ''
//             }
//         }
//     },
// };
// const fileProjectMissingWidget = {
//     'components': {
//         'pages': {
//             'page1': {
//                 'page1.html': '',
//                 'page1.js': '',
//                 'page1.scss': '',
//                 'page1-emulator.json': ''
//             }
//         },
//         'widgets': {
//             'pagedisplay1': {
//                 'pagedisplay1.html': '',
//                 'pagedisplay1.js': '',
//                 'pagedisplay1.scss': '',
//                 'pagedisplay1-emulator.json': ''
//             }
//         }
//     },
// };
// const validAppJson = {
//     "projectName": "Shell-Template",
//     "version": "0.0.1",
//     "faviconPath": "favicon.ico",
//     "menuOrientation": "horizontal",
//     "selectedTheme": "light-theme",
//     "useWebXPanel": true,
//     "themes": [
//         {
//             "name": "light-theme",
//             "path": "./assets/theme/light.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-light.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-light-bg.jpg"
//                 ]
//             }
//         },
//         {
//             "name": "dark-theme",
//             "path": "./assets/theme/dark.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-dark.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-dark-bg.jpg"
//                 ]
//             }
//         },
//         {
//             "name": "custom-theme",
//             "path": "./assets/theme/custom.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-light.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-light-bg.jpg"
//                 ]
//             }
//         }
//     ],
//     "config": {
//         "controlSystem": {}
//     },
//     "header": {
//         "display": true,
//         "displayInfo": true,
//         "$component": ""
//     },
//     "footer": {
//         "display": true,
//         "$component": ""
//     },
//     "content": {
//         "$defaultView": "page1",
//         "triggerViewProperties": {
//             "gestureable": true
//         },
//         "pages": [
//             {
//                 "pageName": "page1",
//                 "fullPath": "./app/project/components/pages/page1/",
//                 "fileName": "page1.html",
//                 "standAloneView": false,
//                 "pageProperties": {
//                     "sendEventOnShow": ""
//                 },
//                 "navigation": {
//                     "sequence": 1,
//                     "label": "menu.page1",
//                     "isI18nLabel": true,
//                     "iconClass": "",
//                     "iconUrl": "./app/project/assets/img/navigation/page.svg",
//                     "iconPosition": "bottom"
//                 }
//             },
//         ],
//         "widgets": [
//             {
//                 "widgetName": "pagedisplay",
//                 "fullPath": "./app/project/components/widgets/pagedisplay/",
//                 "fileName": "pagedisplay.html",
//                 "widgetProperties": {}
//             }
//         ]
//     }
// }
// const duplicatePagesAppJson = {
//     "projectName": "Shell-Template",
//     "version": "0.0.1",
//     "faviconPath": "favicon.ico",
//     "menuOrientation": "horizontal",
//     "selectedTheme": "light-theme",
//     "useWebXPanel": true,
//     "themes": [
//         {
//             "name": "light-theme",
//             "path": "./assets/theme/light.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-light.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-light-bg.jpg"
//                 ]
//             }
//         },
//         {
//             "name": "dark-theme",
//             "path": "./assets/theme/dark.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-dark.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-dark-bg.jpg"
//                 ]
//             }
//         },
//         {
//             "name": "custom-theme",
//             "path": "./assets/theme/custom.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-light.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-light-bg.jpg"
//                 ]
//             }
//         }
//     ],
//     "config": {
//         "controlSystem": {}
//     },
//     "header": {
//         "display": true,
//         "displayInfo": true,
//         "$component": ""
//     },
//     "footer": {
//         "display": true,
//         "$component": ""
//     },
//     "content": {
//         "$defaultView": "page1",
//         "triggerViewProperties": {
//             "gestureable": true
//         },
//         "pages": [
//             {
//                 "pageName": "page1",
//                 "fullPath": "./app/project/components/pages/page1/",
//                 "fileName": "page1.html",
//                 "standAloneView": false,
//                 "pageProperties": {
//                     "sendEventOnShow": ""
//                 },
//                 "navigation": {
//                     "sequence": 1,
//                     "label": "menu.page1",
//                     "isI18nLabel": true,
//                     "iconClass": "",
//                     "iconUrl": "./app/project/assets/img/navigation/page.svg",
//                     "iconPosition": "bottom"
//                 }
//             },
//             {
//                 "pageName": "page1",
//                 "fullPath": "./app/project/components/pages/page1/",
//                 "fileName": "page1.html",
//                 "standAloneView": false,
//                 "pageProperties": {
//                     "sendEventOnShow": ""
//                 },
//                 "navigation": {
//                     "sequence": 1,
//                     "label": "menu.page1",
//                     "isI18nLabel": true,
//                     "iconClass": "",
//                     "iconUrl": "./app/project/assets/img/navigation/page.svg",
//                     "iconPosition": "bottom"
//                 }
//             },
//         ],
//         "widgets": [
//             {
//                 "widgetName": "pagedisplay",
//                 "fullPath": "./app/project/components/widgets/pagedisplay/",
//                 "fileName": "pagedisplay.html",
//                 "widgetProperties": {}
//             }
//         ]
//     }
// }
// const duplicateWidgetsAppJson = {
//     "projectName": "Shell-Template",
//     "version": "0.0.1",
//     "faviconPath": "favicon.ico",
//     "menuOrientation": "horizontal",
//     "selectedTheme": "light-theme",
//     "useWebXPanel": true,
//     "themes": [
//         {
//             "name": "light-theme",
//             "path": "./assets/theme/light.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-light.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-light-bg.jpg"
//                 ]
//             }
//         },
//         {
//             "name": "dark-theme",
//             "path": "./assets/theme/dark.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-dark.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-dark-bg.jpg"
//                 ]
//             }
//         },
//         {
//             "name": "custom-theme",
//             "path": "./assets/theme/custom.css",
//             "brandLogo": {
//                 "url": "./app/template/assets/img/ch5-logo-light.svg",
//                 "alt": "Crestron Logo",
//                 "receiveStateUrl": ""
//             },
//             "backgroundProperties": {
//                 "url": [
//                     "./app/template/assets/img/ch5-stone-light-bg.jpg"
//                 ]
//             }
//         }
//     ],
//     "config": {
//         "controlSystem": {}
//     },
//     "header": {
//         "display": true,
//         "displayInfo": true,
//         "$component": ""
//     },
//     "footer": {
//         "display": true,
//         "$component": ""
//     },
//     "content": {
//         "$defaultView": "page1",
//         "triggerViewProperties": {
//             "gestureable": true
//         },
//         "pages": [
//             {
//                 "pageName": "page1",
//                 "fullPath": "./app/project/components/pages/page1/",
//                 "fileName": "page1.html",
//                 "standAloneView": false,
//                 "pageProperties": {
//                     "sendEventOnShow": ""
//                 },
//                 "navigation": {
//                     "sequence": 1,
//                     "label": "menu.page1",
//                     "isI18nLabel": true,
//                     "iconClass": "",
//                     "iconUrl": "./app/project/assets/img/navigation/page.svg",
//                     "iconPosition": "bottom"
//                 }
//             },
//         ],
//         "widgets": [
//             {
//                 "widgetName": "pagedisplay",
//                 "fullPath": "./app/project/components/widgets/pagedisplay/",
//                 "fileName": "pagedisplay.html",
//                 "widgetProperties": {}
//             },
//             {
//                 "widgetName": "pagedisplay",
//                 "fullPath": "./app/project/components/widgets/pagedisplay/",
//                 "fileName": "pagedisplay.html",
//                 "widgetProperties": {}
//             }
//         ]
//     }
// }
