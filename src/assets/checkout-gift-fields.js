/** Shopify CDN: Minification failed

Line 11:136 Transforming let to the configured target environment ("es5") is not supported yet
Line 11:229 Transforming let to the configured target environment ("es5") is not supported yet
Line 11:549 Transforming const to the configured target environment ("es5") is not supported yet
Line 11:2341 Transforming const to the configured target environment ("es5") is not supported yet
Line 11:3184 Transforming const to the configured target environment ("es5") is not supported yet
Line 11:3240 Transforming const to the configured target environment ("es5") is not supported yet

**/
function clearGiftboxData(){null!=localStorage.getItem("dataGiftbox")&&localStorage.removeItem("dataGiftbox")}function createInput(e,t){let n=document.querySelector(`input[name="checkout[attributes][${e}]"]`);if(n)n.value=t;else{let n=document.createElement("input");n.setAttribute("name",`checkout[attributes][${e}]`),n.setAttribute("type","hidden"),n.setAttribute("value",t),document.querySelector(".step__footer").appendChild(n)}console.log(e,t)}document.addEventListener("DOMContentLoaded",(e=>{if("contact_information"===Shopify.Checkout.step){const e=document.getElementById("checkout_shipping_address_country"),t=document.querySelector("div[data-address-fields]"),n=document.getElementById("continue_button"),a=document.createElement("div"),i=document.createElement("div"),d=document.createElement("div"),c=document.createElement("input"),o=document.createElement("input"),r=document.createElement("label"),l=document.createElement("div"),u=document.createElement("div"),s=document.createElement("label"),m=document.createElement("textarea");document.getElementById("continue_button"),l.id="gift_comments_container",l.classList.add("field"),u.classList.add("field__input-wrapper"),l.style.display="none",a.id="gift_checkbox_container",a.classList.add("field","field--show-floating-label"),i.classList.add("checkbox-wrapper"),d.classList.add("checkbox__input"),o.classList.add("input-checkbox"),c.type="hidden",c.value="false",c.name="checkout[attributes][gift_present]",o.name="checkout[attributes][gift_present]",o.setAttribute("data-backup","gift_present"),o.setAttribute("data-trekkie-id","gift_present"),o.type="checkbox",o.value="true",o.id="gift_present_checkbox",r.classList.add("checkbox__label"),r.setAttribute("for","gift_present_checkbox"),r.textContent="Do you want your order to arrive in gift packaging?",s.classList.add("field__label","field__label--visible"),s.setAttribute("for","gift_present_comments"),s.textContent="Add your own message here:",m.id="gift_present_comments",m.placeholder="Add your own message here:",m.classList.add("field__input"),m.setAttribute("maxlength","70"),m.dataset.attribute="gift_present_text",d.appendChild(c),d.appendChild(o),i.appendChild(d),i.appendChild(r),a.appendChild(i),u.appendChild(s),u.appendChild(m),l.appendChild(u),window.addEventListener("acceptMsgCheckboxDeployed",(n=>{const i=n.detail.element;i.insertAdjacentElement("beforebegin",a),a.insertAdjacentElement("afterend",l),o.addEventListener("change",(e=>{e.target.checked?createInput(m.dataset.attribute,""):(document.querySelector(`input[name="checkout[attributes][${m.dataset.attribute}]"]`)&&document.querySelector(`input[name="checkout[attributes][${m.dataset.attribute}]"]`).remove(),m.value="",m.textContent="")})),m.addEventListener("input",(e=>{document.querySelector(`input[name="checkout[attributes][${e.target.dataset.attribute}]"]`)&&(document.querySelector(`input[name="checkout[attributes][${e.target.dataset.attribute}]"]`).value=e.target.value)})),e.addEventListener("change",(e=>{setTimeout((()=>{t.insertAdjacentElement("beforeend",i),i.insertAdjacentElement("beforebegin",a),a.insertAdjacentElement("afterend",l)}),50)}))})),setTimeout((()=>{const e=localStorage.getItem("dataGiftbox");if(null!=e){const t=JSON.parse(e);t.gift&&(m.value=t.text,o.checked=!0,o.dispatchEvent(new Event("change")))}}),250),n.addEventListener("click",(e=>{""!=m.value&&localStorage.setItem("dataGiftbox",JSON.stringify({gift:!0,text:m.value}))}))}else"thank_you"===Shopify.Checkout.step&&clearGiftboxData()}));
