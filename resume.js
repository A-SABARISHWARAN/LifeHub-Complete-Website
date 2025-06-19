// Tab functionality
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show the selected tab content and mark button as active
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // If preview tab is selected, update the preview
    if (tabName === 'preview') {
        updateJSONPreview();
    }
}

function updateJSONPreview() {
    const jsonInput = document.getElementById('json-input').value;
    const jsonPreview = document.getElementById('json-preview');
    
    try {
        const parsedJson = JSON.parse(jsonInput);
        jsonPreview.textContent = JSON.stringify(parsedJson, null, 2);
        jsonPreview.style.color = 'inherit';
    } catch (e) {
        jsonPreview.textContent = 'Invalid JSON: ' + e.message;
        jsonPreview.style.color = 'red';
    }
}

function generateResume() {
    const jsonInput = document.getElementById('json-input').value;
    const resumeOutput = document.getElementById('resume-output');
    
    try {
        const resumeData = JSON.parse(jsonInput);
        resumeOutput.innerHTML = generateResumeHTML(resumeData);
        document.getElementById('download-pdf').disabled = false;
    } catch (e) {
        resumeOutput.innerHTML = `<div class="error">Error parsing JSON: ${e.message}</div>`;
        document.getElementById('download-pdf').disabled = true;
    }
}

function generateResumeHTML(data) {
    let html = '<div class="resume">';
    
    // Header section
    html += `<div class="resume-header">
        <h1>${data.basics?.name || ''}</h1>
        <div class="label">${data.basics?.label || ''}</div>`;
    
    // Contact info
    if (data.basics?.email || data.basics?.phone || data.basics?.website || data.basics?.location) {
        html += '<div class="contact-info">';
        if (data.basics.email) {
            html += `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.basics.email}</div>`;
        }
        if (data.basics.phone) {
            html += `<div class="contact-item"><i class="fas fa-phone"></i> ${data.basics.phone}</div>`;
        }
        if (data.basics.website) {
            const website = data.basics.website.startsWith('http') ? data.basics.website : 'https://' + data.basics.website;
            html += `<div class="contact-item"><i class="fas fa-globe"></i> <a href="${website}" target="_blank">${data.basics.website}</a></div>`;
        }
        if (data.basics.location) {
            const location = [];
            if (data.basics.location.city) location.push(data.basics.location.city);
            if (data.basics.location.country) location.push(data.basics.location.country);
            html += `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${location.join(', ')}</div>`;
        }
        html += '</div>';
    }
    
    // Social profiles
    if (data.basics?.profiles && data.basics.profiles.length > 0) {
        html += '<div class="social-profiles">';
        data.basics.profiles.forEach(profile => {
            const url = profile.url.startsWith('http') ? profile.url : 'https://' + profile.url;
            const network = profile.network.toLowerCase();
            html += `<a href="${url}" target="_blank" title="${profile.network}">
                <i class="fab fa-${network === 'github' ? 'github' : network === 'linkedin' ? 'linkedin' : 'link'}"></i>
            </a>`;
        });
        html += '</div>';
    }
    
    html += '</div>'; // Close resume-header
    
    // Work experience
    if (data.work && data.work.length > 0) {
        html += `<div class="section">
            <h2 class="section-title">Work Experience</h2>`;
        
        data.work.forEach(job => {
            html += `<div class="work-item">
                <div class="work-header">
                    <div>
                        <span class="company">${job.company || ''}</span>
                        <span class="position">${job.position || ''}</span>
                    </div>
                    <div class="date">${job.startDate || ''} - ${job.endDate || 'Present'}</div>
                </div>`;
            
            if (job.highlights && job.highlights.length > 0) {
                html += '<ul class="highlights">';
                job.highlights.forEach(highlight => {
                    html += `<li>${highlight}</li>`;
                });
                html += '</ul>';
            }
            
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    // Education
    if (data.education && data.education.length > 0) {
        html += `<div class="section">
            <h2 class="section-title">Education</h2>`;
        
        data.education.forEach(edu => {
            html += `<div class="education-item">
                <div class="education-header">
                    <div>
                        <span class="institution">${edu.institution || ''}</span>
                        <span class="area">${edu.studyType || ''}${edu.area ? ` in ${edu.area}` : ''}</span>
                    </div>
                    <div class="date">${edu.startDate || ''} - ${edu.endDate || ''}</div>
                </div>`;
            
            if (edu.gpa) {
                html += `<div>GPA: ${edu.gpa}</div>`;
            }
            
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    // Skills
    if (data.skills && data.skills.length > 0) {
        html += `<div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-list">`;
        
        data.skills.forEach(skill => {
            html += `<div class="skill">${skill.name}${skill.level ? ` <small>(${skill.level})</small>` : ''}</div>`;
        });
        
        html += '</div></div>';
    }
    
    // Languages
    if (data.languages && data.languages.length > 0) {
        html += `<div class="section">
            <h2 class="section-title">Languages</h2>
            <div class="languages-list">`;
        
        data.languages.forEach(lang => {
            html += `<div>${lang.language}${lang.fluency ? ` <small>(${lang.fluency})</small>` : ''}</div>`;
        });
        
        html += '</div></div>';
    }
    
    html += '</div>'; // Close resume
    
    return html;
}

function downloadJSON() {
    const jsonInput = document.getElementById('json-input').value;
    
    try {
        JSON.parse(jsonInput); // Validate JSON
        const blob = new Blob([jsonInput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        alert('Invalid JSON: ' + e.message);
    }
}

function copyJSON() {
    const jsonInput = document.getElementById('json-input');
    jsonInput.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = event.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const resumeOutput = document.getElementById('resume-output');
    
    // Show loading state
    const pdfButton = document.getElementById('download-pdf');
    const originalText = pdfButton.innerHTML;
    pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    pdfButton.disabled = true;
    
    // Create PDF
    html2canvas(resumeOutput, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('resume.pdf');
        
        // Restore button state
        pdfButton.innerHTML = originalText;
        pdfButton.disabled = false;
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        pdfButton.innerHTML = originalText;
        pdfButton.disabled = false;
    });
}

function printResume() {
    const resumeContent = document.getElementById('resume-output').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = resumeContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Regenerate the resume as we replaced the body content
    generateResume();
}

// Form-based resume generation
function generateResumeFromForm() {
    const resumeData = {
        basics: {
            name: document.getElementById('name').value,
            label: document.getElementById('label').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            website: document.getElementById('website').value,
            location: {
                city: document.getElementById('city').value,
                country: document.getElementById('country').value
            },
            profiles: []
        },
        work: [],
        education: [],
        skills: [],
        languages: []
    };

    // Get work experience
    const workItems = document.querySelectorAll('.work-experience-item');
    workItems.forEach(item => {
        const work = {
            company: item.querySelector('.company').value,
            position: item.querySelector('.position').value,
            startDate: item.querySelector('.start-date').value,
            endDate: item.querySelector('.end-date').value || 'Present',
            highlights: item.querySelector('.highlights').value.split('\n').filter(line => line.trim() !== '')
        };
        if (work.company || work.position) {
            resumeData.work.push(work);
        }
    });

    // Get education
    const educationItems = document.querySelectorAll('.education-item');
    educationItems.forEach(item => {
        const education = {
            institution: item.querySelector('.institution').value,
            studyType: item.querySelector('.study-type').value,
            area: item.querySelector('.area').value,
            startDate: item.querySelector('.start-date').value,
            endDate: item.querySelector('.end-date').value,
            gpa: item.querySelector('.gpa').value
        };
        if (education.institution || education.area) {
            resumeData.education.push(education);
        }
    });

    // Get skills
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        const skill = {
            name: item.querySelector('.skill-name').value,
            level: item.querySelector('.skill-level').value
        };
        if (skill.name) {
            resumeData.skills.push(skill);
        }
    });

    // Get languages
    const languageItems = document.querySelectorAll('.language-item');
    languageItems.forEach(item => {
        const language = {
            language: item.querySelector('.language-name').value,
            fluency: item.querySelector('.language-fluency').value
        };
        if (language.language) {
            resumeData.languages.push(language);
        }
    });

    // Get profiles
    const profileItems = document.querySelectorAll('.profile-item');
    profileItems.forEach(item => {
        const profile = {
            network: item.querySelector('.profile-network').value,
            username: item.querySelector('.profile-username').value,
            url: item.querySelector('.profile-url').value
        };
        if (profile.network || profile.username) {
            resumeData.basics.profiles.push(profile);
        }
    });

    // Update JSON input (for consistency with other features)
    document.getElementById('json-input').value = JSON.stringify(resumeData, null, 2);
    
    // Generate the resume
    generateResume();
}

// Form management functions
function addWorkExperience() {
    const container = document.getElementById('work-experience-container');
    const newItem = document.createElement('div');
    newItem.className = 'work-experience-item';
    newItem.innerHTML = `
        <div class="form-group">
            <label>Company</label>
            <input type="text" class="company" required>
        </div>
        <div class="form-group">
            <label>Position</label>
            <input type="text" class="position" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="start-date" placeholder="YYYY-MM" required>
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="end-date" placeholder="YYYY-MM or Present">
            </div>
        </div>
        <div class="form-group">
            <label>Highlights (one per line)</label>
            <textarea class="highlights" rows="3"></textarea>
        </div>
        <button type="button" class="remove-btn" onclick="removeWorkExperience(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function removeWorkExperience(button) {
    const container = document.getElementById('work-experience-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert("You need at least one work experience entry.");
    }
}

function addEducation() {
    const container = document.getElementById('education-container');
    const newItem = document.createElement('div');
    newItem.className = 'education-item';
    newItem.innerHTML = `
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="institution" required>
        </div>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="study-type" placeholder="e.g., Bachelor" required>
        </div>
        <div class="form-group">
            <label>Field of Study</label>
            <input type="text" class="area" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="start-date" placeholder="YYYY-MM">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="end-date" placeholder="YYYY-MM">
            </div>
        </div>
        <div class="form-group">
            <label>GPA</label>
            <input type="text" class="gpa">
        </div>
        <button type="button" class="remove-btn" onclick="removeEducation(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function removeEducation(button) {
    const container = document.getElementById('education-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert("You need at least one education entry.");
    }
}

function addSkill() {
    const container = document.getElementById('skills-container');
    const newItem = document.createElement('div');
    newItem.className = 'skill-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Skill Name</label>
                <input type="text" class="skill-name" required>
            </div>
            <div class="form-group">
                <label>Level</label>
                <input type="text" class="skill-level" placeholder="e.g., Advanced">
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeSkill(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function removeSkill(button) {
    const container = document.getElementById('skills-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert("You need at least one skill entry.");
    }
}

function addLanguage() {
    const container = document.getElementById('languages-container');
    const newItem = document.createElement('div');
    newItem.className = 'language-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Language</label>
                <input type="text" class="language-name" required>
            </div>
            <div class="form-group">
                <label>Fluency</label>
                <input type="text" class="language-fluency" placeholder="e.g., Fluent">
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeLanguage(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function removeLanguage(button) {
    const container = document.getElementById('languages-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert("You need at least one language entry.");
    }
}

function addProfile() {
    const container = document.getElementById('profiles-container');
    const newItem = document.createElement('div');
    newItem.className = 'profile-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Network</label>
                <input type="text" class="profile-network" placeholder="e.g., LinkedIn" required>
            </div>
            <div class="form-group">
                <label>Username</label>
                <input type="text" class="profile-username" required>
            </div>
        </div>
        <div class="form-group">
            <label>URL</label>
            <input type="url" class="profile-url" required>
        </div>
        <button type="button" class="remove-btn" onclick="removeProfile(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function removeProfile(button) {
    const container = document.getElementById('profiles-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert("You need at least one profile entry.");
    }
}

function resetForm() {
    if (confirm('Are you sure you want to reset all form data?')) {
        document.getElementById('resume-form').reset();
        
        // Reset dynamic sections to one item each
        const containers = [
            'work-experience-container',
            'education-container',
            'skills-container',
            'languages-container',
            'profiles-container'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
        });
    }
}

// Initialize with example JSON if empty
document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('json-input');
    if (!jsonInput.value) {
        jsonInput.value = document.getElementById('json-example').textContent;
    }
    
    // Initialize form with one entry for each section
    addWorkExperience();
    addEducation();
    addSkill();
    addLanguage();
    addProfile();
});