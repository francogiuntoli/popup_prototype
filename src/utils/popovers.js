export const popover = {
    id: "A unique identifier for the rule. It cannot be shared between multiple rules. It will be passed as a Custom Variable (CVar) to the conversation so that you can use it to customize the starting flow of your chatbot. The id of the active pop-up is passed to the conversation under the CVar 'current_popup'.",
    trigger:"The following options are available: 'page_load', 'chat_minimized' and 'visitor_inactive.",
    enabled:"Whether the rule should be enabled on specified devices.",
    repeat:"Controls how often the active pop-up rule should be rendered. If set to 0, then it will be rendered every time. If set to 2, then it will be rendered upon the first visit, and then again on the third visit.",
    delay:"Controls after how much time(in milliseconds), the active pop-up message should be rendered after the specified trigger action.",
    condition:"Whether the rule is active or not. It can be used to customize the scenario in which the pop-up should be active. For instance, a function could check for the current page URL and set the condition to either true or false.",
    event_condition:"Select and option from page's path/URL, and either product_title or page_request returned from Shopify's object",
    event_logic:"Logic to compare the condition event and the condition value",
    condition_value:"Value to apply as the final part of the condition",
    messages:"Based on the browsers language or the page's language, it matches the language value and renders the corresponding text/s as popups."
}