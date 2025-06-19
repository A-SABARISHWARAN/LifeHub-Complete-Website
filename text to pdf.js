document.addEventListener('DOMContentLoaded', function() {
    const { jsPDF } = window.jspdf;
    
    // DOM elements
    const pdfTitleInput = document.getElementById('pdfTitle');
    const textInput = document.getElementById('textInput');
    const fileNameInput = document.getElementById('fileName');
    const fontSizeSelect = document.getElementById('fontSize');
    const themeColorSelect = document.getElementById('themeColor');
    const generateBtn = document.getElementById('generateBtn');
    const cardHeader = document.querySelector('.card-header');
    
    // Theme color changer
    themeColorSelect.addEventListener('change', function() {
        document.body.className = `${this.value}-theme`;
        updateHeaderGradient();
    });
    
    function updateHeaderGradient() {
        const theme = themeColorSelect.value;
        let gradient;
        
        switch(theme) {
            case 'purple':
                gradient = 'linear-gradient(135deg, var(--purple1), var(--purple2))';
                break;
            case 'green':
                gradient = 'linear-gradient(135deg, var(--green1), var(--green2))';
                break;
            case 'red':
                gradient = 'linear-gradient(135deg, var(--red1), var(--red2))';
                break;
            default: // blue
                gradient = 'linear-gradient(135deg, var(--blue1), var(--blue2))';
        }
        
        cardHeader.style.background = gradient;
        generateBtn.style.background = gradient;
    }
    
    // Generate PDF function
    function generatePDF() {
        const text = textInput.value.trim();
        const pdfTitle = pdfTitleInput.value.trim() || "My Document";
        
        if (!text) {
            alert('Please enter some text to convert to PDF.');
            textInput.focus();
            return;
        }
        
        // Get file name or use default
        let fileName = fileNameInput.value.trim();
        if (!fileName) {
            fileName = 'document.pdf';
        } else if (!fileName.endsWith('.pdf')) {
            fileName += '.pdf';
        }
        
        // Get selected font size
        const fontSize = parseInt(fontSizeSelect.value);
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Set document properties
        doc.setProperties({
            title: pdfTitle,
            subject: 'Text converted to PDF',
            author: 'Ultimate PDF Converter',
            keywords: 'text, pdf, converter',
            creator: 'Ultimate PDF Converter'
        });
        
        // Add border to the page
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Draw decorative border
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        
        // Add header with title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(pdfTitle, pageWidth / 2, 20, { align: 'center' });
        
        // Add horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(15, 25, pageWidth - 15, 25);
        
        // Set content font
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        // Split text into lines that fit the page width
        const margins = 20;
        const maxWidth = pageWidth - margins * 2;
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        // Add text to PDF with proper spacing
        let y = 35;
        const lineHeight = fontSize * 0.35;
        
        for (let i = 0; i < lines.length; i++) {
            // Check if we need a new page
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
                
                // Add border to new page
                doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
                
                // Add page footer
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                
                // Reset for content
                doc.setFontSize(fontSize);
                doc.setTextColor(60, 60, 60);
            }
            
            doc.text(lines[i], margins, y);
            y += lineHeight;
        }
        
        // Add footer to last page
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Save the PDF
        doc.save(fileName);
    }
    
    generateBtn.addEventListener('click', generatePDF);
    
    // Initialize theme
    updateHeaderGradient();
});