document.addEventListener('DOMContentLoaded', () => {

    const simpleCheckboxes = document.querySelectorAll('.item-checkbox:not(#design_sub_check):not(#coding_sub_check)');
    const totalPriceElement = document.getElementById('total-price');
    const ctaButton = document.getElementById('cta-button');

    // --- Elements for sub-page design ---
    const designSubCheck = document.getElementById('design_sub_check');
    const designSubPages = document.getElementById('design_sub_pages');
    const designSubTotal = document.getElementById('design_sub_total');
    const designSubItem = document.getElementById('subpage_design_item');

    // --- Elements for sub-page coding ---
    const codingSubCheck = document.getElementById('coding_sub_check');
    const codingSubPages = document.getElementById('coding_sub_pages');
    const codingSubTotal = document.getElementById('coding_sub_total');
    const codingSubItem = document.getElementById('subpage_coding_item');

    // --- Elements for Contact Modal ---
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    const modalCancelButton = document.getElementById('modal-cancel-button');
    const modalSubmitButton = document.getElementById('modal-submit-button');

    
    // --- Function to update sub-total for dropdown items ---
    function updateSubTotal(selectElement, totalElement) {
        const pages = parseInt(selectElement.value, 10);
        const pricePerOne = parseInt(selectElement.dataset.price, 10);
        totalElement.textContent = (pages * pricePerOne).toLocaleString();
    }
    
    // --- Function to calculate the total price ---
    function calculateTotal() {
        let total = 80000; // Start with the basic fee

        // Calculate for simple checkboxes
        simpleCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += parseInt(checkbox.dataset.price, 10);
            }
        });

        // Calculate for sub-page design
        if (designSubCheck.checked) {
            total += parseInt(designSubPages.value, 10) * parseInt(designSubPages.dataset.price, 10);
        }

        // Calculate for sub-page coding
        if (codingSubCheck.checked) {
            total += parseInt(codingSubPages.value, 10) * parseInt(codingSubPages.dataset.price, 10);
        }
        
        totalPriceElement.textContent = total.toLocaleString();
    }

    // --- Event listeners for simple checkboxes ---
    simpleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });

    // --- Event listeners for sub-page design ---
    designSubCheck.addEventListener('change', () => {
        designSubPages.disabled = !designSubCheck.checked;
        designSubItem.classList.toggle('checked', designSubCheck.checked);
        calculateTotal();
    });
    designSubPages.addEventListener('change', () => {
        updateSubTotal(designSubPages, designSubTotal);
        calculateTotal();
    });
    
    // --- Event listeners for sub-page coding ---
    codingSubCheck.addEventListener('change', () => {
        codingSubPages.disabled = !codingSubCheck.checked;
        codingSubItem.classList.toggle('checked', codingSubCheck.checked);
        calculateTotal();
    });
    codingSubPages.addEventListener('change', () => {
        updateSubTotal(codingSubPages, codingSubTotal);
        calculateTotal();
    });

    // --- Modal Handling ---
    // Open modal when CTA button is clicked
    ctaButton.addEventListener('click', () => {
        contactModal.classList.remove('hidden');
    });

    // Close modal when cancel button is clicked or outside area is clicked
    modalCancelButton.addEventListener('click', () => {
        contactModal.classList.add('hidden');
    });
    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            contactModal.classList.add('hidden');
        }
    });

    // --- Form submission to generate mailto link ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent actual form submission

        // !!! IMPORTANT: Change this to your actual email address !!!
        const yourEmail = 'boboboborn1993@gmail.com'; 
        
        const subject = 'Web制作のお見積もり依頼（シミュレーション経由）';
        
        let body = 'YAMAMOTO CREATE様\n\n';
        body += 'Webサイト制作の件で、以下の内容にてお見積もりを希望します。\n\n';
        
        // Append customer info from modal
        const customerName = document.getElementById('customer_name').value;
        const customerContactPerson = document.getElementById('customer_contact_person').value;
        const customerTel = document.getElementById('customer_tel').value;
        const customerEmail = document.getElementById('customer_email').value;
        const customerDetails = document.getElementById('customer_details').value;

        body += '---------- [お客様情報] ----------\n';
        body += `■ 会社名／お名前： ${customerName}\n`;
        if (customerContactPerson) {
            body += `■ ご担当者様： ${customerContactPerson}\n`;
        }
        body += `■ ご連絡先TEL： ${customerTel}\n`;
        body += `■ メールアドレス： ${customerEmail}\n`;
        body += '-------------------------------------\n\n';
        
        // Append selected items
        body += '---------- [選択した項目] ----------\n';
        body += '・基本料金（¥80,000）\n';

        let selectedItemsTotal = 80000;

        simpleCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const itemName = checkbox.dataset.name;
                const itemPrice = parseInt(checkbox.dataset.price, 10);
                selectedItemsTotal += itemPrice;
                body += `・${itemName}（¥${itemPrice.toLocaleString()}）\n`;
            }
        });
        
        if (designSubCheck.checked) {
            const pages = designSubPages.value;
            const price = parseInt(designSubPages.dataset.price, 10) * pages;
            selectedItemsTotal += price;
            body += `・下層ページデザイン（${pages}ページ）（¥${price.toLocaleString()}）\n`;
        }
        
        if (codingSubCheck.checked) {
            const pages = codingSubPages.value;
            const price = parseInt(codingSubPages.dataset.price, 10) * pages;
            selectedItemsTotal += price;
            body += `・下層ページコーディング（${pages}ページ）（¥${price.toLocaleString()}）\n`;
        }

        body += '-------------------------------------\n\n';
        body += `■ 概算合計金額（税抜）: ¥${selectedItemsTotal.toLocaleString()}\n\n`;
        
        // Append details from textarea
        if(customerDetails){
             body += '---------- [ご相談内容詳細] ----------\n';
             body += `${customerDetails}\n`;
             body += '-------------------------------------\n\n';
        } else {
             body += '■ ご相談内容詳細\n';
             body += '（こちらに具体的なご相談内容をご記入ください）\n\n';
        }


        const mailtoLink = `mailto:${yourEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        // Hide modal after creating mail link
        contactModal.classList.add('hidden');
    });

    // --- Initial calculation on page load ---
    updateSubTotal(designSubPages, designSubTotal);
    updateSubTotal(codingSubPages, codingSubTotal);
    calculateTotal();
});