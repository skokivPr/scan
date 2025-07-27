/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// API Key will be managed through the UI
let API_KEY = ""; // Changed to empty string as per instructions

const imageUpload = document.getElementById('image-upload');
const sngpsImageUpload = document.getElementById('sngps-image-upload');
const extractButton = document.getElementById('extract-button');
const resultText = document.getElementById('result-text');
const loadingIndicator = document.getElementById('loading-indicator');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

const imagePreview = document.getElementById('image-preview');
const mainImagePreviewContainer = document.getElementById('main-image-preview-container');
const zoomIconOverlay = document.getElementById('zoom-icon-overlay');

const sngpsImagePreview = document.getElementById('sngps-image-preview');
const sngpsImagePreviewContainer = document.getElementById('sngps-image-preview-container');

const copyButtonsContainer = document.getElementById('copy-buttons-container');
const copyTextButton = document.getElementById('copy-text-button');
const copyMarkdownButton = document.getElementById('copy-markdown-button');
const themeToggleButton = document.getElementById('theme-toggle-button');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// API Key elements
const apiKeyModalButton = document.getElementById('api-key-modal-button');
const apiKeyModal = document.getElementById('api-key-modal');
const apiKeyModalClose = document.getElementById('api-key-modal-close');
const apiKeyIndicator = document.getElementById('api-key-indicator');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key-button');
const toggleApiKeyVisibilityButton = document.getElementById('toggle-api-key-visibility');
const clearApiKeyButton = document.getElementById('clear-api-key-button');
const apiKeyStatus = document.getElementById('api-key-status');

// Modal elements
const imageModal = document.getElementById('image-modal');
const enlargedImage = document.getElementById('enlarged-image');
const modalCloseButton = document.getElementById('modal-close-button');

let selectedFile = null;
let selectedSnGpsFile = null;
// AI client will be initialized within the fetch call or when API_KEY is set.
// The `GoogleGenAI` library is not used directly here, but a fetch call is used as per instructions.

// Theme constants
const THEME_KEY = 'themePreference';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

// API Key constants
const API_KEY_STORAGE_KEY = 'googleAiApiKey';

// API Key management functions
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showApiKeyStatus('Please enter an API key', 'error');
        return;
    }

    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    API_KEY = apiKey;

    // No direct `new GoogleGenAI` here, as per new instructions to use fetch.
    showApiKeyStatus('API key saved successfully!', 'success');
    updateUIForApiKey(true);

    // Close modal after successful save
    setTimeout(() => {
        closeApiKeyModal();
    }, 1500);
}

function loadApiKey() {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
        API_KEY = savedApiKey;
        apiKeyInput.value = savedApiKey;
        showApiKeyStatus('API key loaded from storage', 'success');
        updateUIForApiKey(true);
    } else {
        updateUIForApiKey(false);
    }
}

function clearApiKey() {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    API_KEY = ""; // Set to empty string
    apiKeyInput.value = '';
    showApiKeyStatus('API key cleared', 'info');
    updateUIForApiKey(false);
}

function showApiKeyStatus(message, type) {
    apiKeyStatus.textContent = message;
    apiKeyStatus.className = `status-message ${type}`;
    apiKeyStatus.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        apiKeyStatus.style.display = 'none';
    }, 3000);
}

function updateUIForApiKey(hasApiKey) {
    if (extractButton) extractButton.disabled = !hasApiKey;
    if (imageUpload) imageUpload.disabled = !hasApiKey;
    if (sngpsImageUpload) sngpsImageUpload.disabled = !hasApiKey;

    const labels = document.querySelectorAll('label.add-button');
    labels.forEach(label => {
        if (label.htmlFor === 'image-upload' || label.htmlFor === 'sngps-image-upload') {
            if (hasApiKey) {
                label.style.cursor = 'pointer';
                label.title = '';
                label.style.backgroundColor = '';
                label.style.opacity = '';
            } else {
                label.style.cursor = 'not-allowed';
                label.title = 'Please configure your API key first';
                label.style.backgroundColor = '#9ca3af';
                label.style.opacity = '0.7';
            }
        }
    });

    // Update API key button appearance
    if (apiKeyModalButton) {
        if (hasApiKey) {
            apiKeyModalButton.style.borderColor = '#10b981';
            apiKeyModalButton.style.color = '#10b981';
            apiKeyModalButton.title = 'API Key configured - Click to manage';
        } else {
            apiKeyModalButton.style.borderColor = '#ef4444';
            apiKeyModalButton.style.color = '#ef4444';
            apiKeyModalButton.title = 'API Key not configured - Click to configure';
        }
    }

    // Update API key indicator
    if (apiKeyIndicator) {
        if (hasApiKey) {
            apiKeyIndicator.classList.remove('hidden');
            apiKeyIndicator.classList.add('configured');
        } else {
            apiKeyIndicator.classList.remove('hidden', 'configured');
        }
    }

    if (hasApiKey) {
        errorMessage.classList.add('hidden');
    } else {
        errorMessage.textContent = "Please configure your Google AI API key to use the extraction service.";
        errorMessage.classList.remove('hidden');
    }
}

function toggleApiKeyVisibility() {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';

    const icon = toggleApiKeyVisibilityButton.querySelector('i');
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// Modal functions
function openApiKeyModal() {
    if (apiKeyModal) {
        apiKeyModal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        // Focus on the input field
        if (apiKeyInput) {
            setTimeout(() => apiKeyInput.focus(), 100);
        }
    }
}

function closeApiKeyModal() {
    if (apiKeyModal) {
        apiKeyModal.classList.add('hidden');
        document.body.classList.remove('modal-open');

        // Hide status message when closing
        if (apiKeyStatus) {
            apiKeyStatus.style.display = 'none';
        }
    }
}

function applyTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === DARK_THEME);

    if (themeToggleButton && sunIcon && moonIcon) {
        if (theme === DARK_THEME) {
            sunIcon.style.display = 'inline';
            moonIcon.style.display = 'none';
            themeToggleButton.setAttribute('aria-label', 'Switch to light theme');
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline';
            themeToggleButton.setAttribute('aria-label', 'Switch to dark theme');
        }
    }
    localStorage.setItem(THEME_KEY, theme);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? DARK_THEME : LIGHT_THEME);
    }
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
    });
}

// API Key event listeners
if (apiKeyModalButton) {
    apiKeyModalButton.addEventListener('click', openApiKeyModal);
}

if (apiKeyModalClose) {
    apiKeyModalClose.addEventListener('click', closeApiKeyModal);
}

if (apiKeyModal) {
    apiKeyModal.addEventListener('click', (event) => {
        if (event.target === apiKeyModal) {
            closeApiKeyModal();
        }
    });
}

if (saveApiKeyButton) {
    saveApiKeyButton.addEventListener('click', saveApiKey);
}

if (toggleApiKeyVisibilityButton) {
    toggleApiKeyVisibilityButton.addEventListener('click', toggleApiKeyVisibility);
}

if (clearApiKeyButton) {
    clearApiKeyButton.addEventListener('click', clearApiKey);
}

if (apiKeyInput) {
    apiKeyInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveApiKey();
        }
    });

    apiKeyInput.addEventListener('input', () => {
        // Hide status when user starts typing
        if (apiKeyStatus) {
            apiKeyStatus.style.display = 'none';
        }
    });
}

function updateCopyButtonsVisibility() {
    if (copyButtonsContainer && resultText) {
        const hasContent = resultText.innerHTML.trim() !== '';
        if (hasContent) {
            copyButtonsContainer.classList.remove('hidden');
        } else {
            copyButtonsContainer.classList.add('hidden');
        }
    }
}

function handleFileSelect(event, isMainImage) {
    const files = event.target.files;
    const targetFile = files && files.length > 0 ? files[0] : null;
    const previewElement = isMainImage ? imagePreview : sngpsImagePreview;
    const previewContainer = isMainImage ? mainImagePreviewContainer : sngpsImagePreviewContainer;

    if (isMainImage) {
        selectedFile = targetFile;
    } else {
        selectedSnGpsFile = targetFile;
    }

    if (targetFile) {
        errorMessage.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewElement && e.target && typeof e.target.result === 'string') {
                previewElement.src = e.target.result;
                previewElement.classList.remove('hidden');
                if (previewContainer) previewContainer.classList.remove('hidden');
                if (isMainImage) {
                    imagePreview.classList.add('clickable-preview');
                    if (zoomIconOverlay) zoomIconOverlay.classList.remove('hidden');
                }
            }
        }
        reader.readAsDataURL(targetFile);
    } else { // File cleared
        if (previewElement) {
            previewElement.classList.add('hidden');
            previewElement.src = "#";
        }
        if (previewContainer) {
            previewContainer.classList.add('hidden');
        }

        if (isMainImage) {
            imagePreview.classList.remove('clickable-preview');
            if (zoomIconOverlay) zoomIconOverlay.classList.add('hidden');
        }
    }
    updateCopyButtonsVisibility();
}

if (imageUpload) {
    imageUpload.addEventListener('change', (event) => {
        handleFileSelect(event, true);
    });
}

if (sngpsImageUpload) {
    sngpsImageUpload.addEventListener('change', (event) => handleFileSelect(event, false));
}

function parseGeminiResponse(rawText) {
    if (!rawText) return null;
    let jsonStr = rawText.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Response was not JSON or failed to parse, displaying raw text.", e);
        return { _raw_error_text: rawText };
    }
}

function displayResults(data) {
    resultText.innerHTML = '';
    if (!data || Object.keys(data).length === 0) {
        resultText.innerHTML = '<p>No details extracted or an error occurred.</p>';
        updateCopyButtonsVisibility();
        return;
    }

    if (data._raw_error_text && Object.keys(data).length === 1) { // Only raw error text
        resultText.innerHTML = `<p>Response from the model (not valid JSON):</p><pre>${data._raw_error_text}</pre>`;
        updateCopyButtonsVisibility();
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'extracted-data-list';
    let foundStructuredData = false;

    const displayOrder = ["VRID", "Trailer_number", "CRID", "SerialNumberGPS"];
    const dataKeys = Object.keys(data);
    const keysToDisplay = [...new Set([...displayOrder.filter(k => dataKeys.includes(k)), ...dataKeys])];

    for (const key of keysToDisplay) {
        if (Object.prototype.hasOwnProperty.call(data, key) && key !== '_raw_error_text') {
            foundStructuredData = true;
            const li = document.createElement('li');
            const strong = document.createElement('strong');

            let label = key.replace(/_/g, ' ');
            label = label.replace(/([A-Z]+)/g, ' $1').replace(/GPS/g, 'GPS'); // Keep GPS uppercase
            label = label.replace(/^./, (str) => str.toUpperCase());
            label = label.trim();
            strong.textContent = `${label}:`;
            li.appendChild(strong);

            const value = data[key];
            const valueText = value !== null && value !== undefined && String(value).trim() !== '' ? String(value) : 'N/A';

            const valueSpan = document.createElement('span');

            if (key.toUpperCase() === "CRID" && typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
                const anchor = document.createElement('a');
                anchor.href = value;
                anchor.textContent = valueText;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                valueSpan.appendChild(anchor);
            } else {
                valueSpan.appendChild(document.createTextNode(valueText));
            }
            li.appendChild(valueSpan);
            ul.appendChild(li);
        }
    }

    if (data._raw_error_text) { // If there was a raw error text alongside some parsed data
        const errorP = document.createElement('p');
        errorP.innerHTML = `<strong>Note:</strong> Part of the response could not be parsed as JSON:`;
        const errorPre = document.createElement('pre');
        errorPre.textContent = data._raw_error_text;
        resultText.appendChild(errorP);
        resultText.appendChild(errorPre);
    }

    if (foundStructuredData && ul.children.length > 0) {
        resultText.appendChild(ul);
    } else if (!data._raw_error_text) { // Only if no structured data AND no raw error was shown above
        resultText.innerHTML = '<p>No extractable details found in the response.</p>';
    }
    updateCopyButtonsVisibility();
}

if (extractButton) {
    extractButton.addEventListener('click', async () => {
        if (!API_KEY) { // Check API_KEY directly
            errorMessage.textContent = "Please enter and save your Google AI API key first.";
            errorMessage.classList.remove('hidden');
            resultText.innerHTML = '';
            updateCopyButtonsVisibility();
            return;
        }
        if (!selectedFile) {
            errorMessage.textContent = 'Please select the main image first.';
            errorMessage.classList.remove('hidden');
            resultText.innerHTML = '';
            updateCopyButtonsVisibility();
            return;
        }

        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        resultText.innerHTML = '';
        updateCopyButtonsVisibility();
        extractButton.disabled = true;

        let accumulatedErrors = [];
        let combinedExtractedData = {};

        try {
            loadingMessage.textContent = 'Extracting details from main image...';
            const mainImageBase64 = await fileToGenerativePart(selectedFile);
            
            let mainPromptFields = ["VRID (Vehicle Registration ID)", "Trailer_number (Trailer Number)", "CRID (Consignment Reference ID)"];
            if (!selectedSnGpsFile) {
                mainPromptFields.push("SerialNumberGPS (Serial Number GPS)");
            }
            const mainText = `Extract the following details from the image: ${mainPromptFields.join(', ')}. For each field, if the detail is not present or clear, return "N/A" as its value. Provide the output strictly in JSON format.`;
            
            const payloadMain = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: mainText },
                            {
                                inlineData: {
                                    mimeType: selectedFile.type,
                                    data: mainImageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            };
            // Corrected the model name to gemini-1.5-flash
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

            try {
                const responseMain = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadMain)
                });
                const resultMain = await responseMain.json();
                
                let mainJson = null;
                if (resultMain.candidates && resultMain.candidates.length > 0 &&
                    resultMain.candidates[0].content && resultMain.candidates[0].content.parts &&
                    resultMain.candidates[0].content.parts.length > 0) {
                    mainJson = parseGeminiResponse(resultMain.candidates[0].content.parts[0].text);
                } else {
                    console.warn("Unexpected response structure from main image API call:", resultMain);
                    accumulatedErrors.push("Unexpected response from main image API.");
                }

                if (mainJson) {
                    combinedExtractedData = { ...combinedExtractedData, ...mainJson };
                    if (mainJson._raw_error_text && Object.keys(mainJson).length === 1) accumulatedErrors.push("Main image response could not be parsed as JSON.");
                } else {
                    accumulatedErrors.push("No data extracted from main image.");
                }
            } catch (e) {
                console.error('Error extracting from main image:', e);
                accumulatedErrors.push(`Error with main image: ${e.message || 'Unknown error'}`);
            }

            if (selectedSnGpsFile) {
                loadingMessage.textContent = 'Extracting S/N GPS from specific image...';
                const snGpsImageBase64 = await fileToGenerativePart(selectedSnGpsFile);
                const snGpsText = "Extract only SerialNumberGPS (Serial Number GPS) from the image. If not present or clear, return \"N/A\" as its value. Provide the output strictly in JSON format, like {\"SerialNumberGPS\": \"value\"}.";
                
                const payloadSnGps = {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: snGpsText },
                                {
                                    inlineData: {
                                        mimeType: selectedSnGpsFile.type,
                                        data: snGpsImageBase64
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                };
                
                try {
                    const responseSnGps = await fetch(apiUrl, { // Reuse apiUrl
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payloadSnGps)
                    });
                    const resultSnGps = await responseSnGps.json();

                    let snGpsJson = null;
                    if (resultSnGps.candidates && resultSnGps.candidates.length > 0 &&
                        resultSnGps.candidates[0].content && resultSnGps.candidates[0].content.parts &&
                        resultSnGps.candidates[0].content.parts.length > 0) {
                        snGpsJson = parseGeminiResponse(resultSnGps.candidates[0].content.parts[0].text);
                    } else {
                        console.warn("Unexpected response structure from S/N GPS image API call:", resultSnGps);
                        accumulatedErrors.push("Unexpected response from S/N GPS image API.");
                    }

                    if (snGpsJson) {
                        if (snGpsJson.SerialNumberGPS !== undefined) {
                            combinedExtractedData.SerialNumberGPS = snGpsJson.SerialNumberGPS;
                        }
                        if (snGpsJson._raw_error_text && Object.keys(snGpsJson).length === 1) {
                            accumulatedErrors.push("S/N GPS image response could not be parsed as JSON.");
                            if (combinedExtractedData._raw_error_text && snGpsJson._raw_error_text) {
                                combinedExtractedData._raw_error_text = `Main Img Error: ${combinedExtractedData._raw_error_text}\nS/N GPS Img Error: ${snGpsJson._raw_error_text}`;
                            } else if (snGpsJson._raw_error_text) {
                                combinedExtractedData._raw_error_text = snGpsJson._raw_error_text;
                            }
                        } else if (!snGpsJson.SerialNumberGPS && !combinedExtractedData.SerialNumberGPS) {
                            combinedExtractedData.SerialNumberGPS = "N/A (from S/N GPS image attempt)";
                        }
                    } else {
                        accumulatedErrors.push("No SerialNumberGPS data extracted from S/N GPS image.");
                    }
                } catch (e) {
                    console.error('Error extracting from S/N GPS image:', e);
                    accumulatedErrors.push(`Error with S/N GPS image: ${e.message || 'Unknown error'}`);
                }
            }

            if (accumulatedErrors.length > 0 && Object.keys(combinedExtractedData).filter(k => k !== '_raw_error_text').length === 0) {
                if (!combinedExtractedData._raw_error_text) {
                    combinedExtractedData._raw_error_text = accumulatedErrors.join(' ');
                }
                errorMessage.textContent = accumulatedErrors.join(' ');
                errorMessage.classList.remove('hidden');
            } else if (accumulatedErrors.length > 0) {
                errorMessage.textContent = "Partial data extracted. Errors: " + accumulatedErrors.join(' ');
                errorMessage.classList.remove('hidden');
            }

        } catch (error) {
            console.error('General error during extraction:', error);
            let displayError = 'An unexpected error occurred during the extraction process.';
            if (error instanceof Error) {
                displayError = `Error: ${error.message}`;
            }
            errorMessage.textContent = displayError;
            errorMessage.classList.remove('hidden');
            resultText.innerHTML = '';
            combinedExtractedData = { _raw_error_text: displayError };
        } finally {
            displayResults(combinedExtractedData);
            loadingIndicator.classList.add('hidden');
            if (extractButton) extractButton.disabled = false;
        }
    });
}

async function fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as base64 string."));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

function showCopiedFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.disabled = true;
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

if (copyTextButton) {
    copyTextButton.addEventListener('click', async () => {
        let textToCopy = 'No data to copy.';
        const items = [];
        const listItems = resultText.querySelectorAll('.extracted-data-list li');

        listItems.forEach(li => {
            const strongElement = li.querySelector('strong');
            const label = strongElement ? strongElement.textContent?.trim() : '';

            let value = '';
            const anchorElement = li.querySelector('a');
            const valueSpan = li.querySelector('span');

            if (anchorElement) {
                value = anchorElement.textContent?.trim() || '';
            } else if (valueSpan) {
                value = valueSpan.textContent?.trim() || '';
            }

            if (label) {
                items.push(`${label} ${value.trim()}`);
            }
        });

        const preElement = resultText.querySelector('pre');
        if (items.length > 0) {
            textToCopy = items.join('\n');
            if (preElement && preElement.textContent) {
                textToCopy += `\n\nNote: Part of the response could not be parsed as JSON:\n${preElement.textContent.trim()}`;
            }
        } else if (preElement && preElement.textContent) {
            textToCopy = preElement.textContent.trim();
        }

        try {
            // Using document.execCommand('copy') for clipboard operations due to potential iframe restrictions
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showCopiedFeedback(copyTextButton);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            errorMessage.textContent = 'Failed to copy text.';
            errorMessage.classList.remove('hidden');
        }
    });
}

if (copyMarkdownButton) {
    copyMarkdownButton.addEventListener('click', async () => {
        let markdownToCopy = 'No data to copy.';
        const items = [];
        const listItems = resultText.querySelectorAll('.extracted-data-list li');

        listItems.forEach(li => {
            const strongElement = li.querySelector('strong');
            let label = strongElement ? strongElement.textContent?.trim() : '';
            if (label.endsWith(':')) {
                label = label.slice(0, -1);
            }

            let value = '';
            let isLink = false;
            let linkHref = '';

            const anchorElement = li.querySelector('a');
            const valueSpan = li.querySelector('span');

            if (anchorElement) {
                value = anchorElement.textContent?.trim() || '';
                linkHref = anchorElement.href;
                isLink = true;
            } else if (valueSpan) {
                value = valueSpan.textContent?.trim() || '';
            }

            if (label) {
                if (isLink) {
                    items.push(`- **${label}:** [${value}](${linkHref})`);
                } else {
                    items.push(`- **${label}:** ${value}`);
                }
            }
        });

        const preElement = resultText.querySelector('pre');
        if (items.length > 0) {
            markdownToCopy = items.join('\n');
            if (preElement && preElement.textContent) {
                markdownToCopy += `\n\n**Note:** Part of the response could not be parsed as JSON:\n\`\`\`\n${preElement.textContent.trim()}\n\`\`\``;
            }
        } else if (preElement && preElement.textContent) {
            markdownToCopy = "```text\n" + preElement.textContent.trim() + "\n```";
        }

        try {
            // Using document.execCommand('copy') for clipboard operations due to potential iframe restrictions
            const textarea = document.createElement('textarea');
            textarea.value = markdownToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showCopiedFeedback(copyMarkdownButton);
        } catch (err) {
            console.error('Failed to copy Markdown: ', err);
            errorMessage.textContent = 'Failed to copy Markdown.';
            errorMessage.classList.remove('hidden');
        }
    });
}

// Image Modal Logic
function openImageModal(imageUrl) {
    if (imageModal && enlargedImage) {
        enlargedImage.src = imageUrl;
        imageModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modalCloseButton?.focus();
    }
}

function closeImageModal() {
    if (imageModal) {
        imageModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        if (enlargedImage) enlargedImage.src = "#";
    }
}

if (imagePreview) {
    imagePreview.addEventListener('click', () => {
        if (imagePreview.src && imagePreview.src !== '#' && !imagePreview.classList.contains('hidden')) {
            openImageModal(imagePreview.src);
        }
    });
}

if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeImageModal);
    modalCloseButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            closeImageModal();
        }
    });
}

if (imageModal) {
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (imageModal && !imageModal.classList.contains('hidden')) {
            closeImageModal();
        } else if (apiKeyModal && !apiKeyModal.classList.contains('hidden')) {
            closeApiKeyModal();
        }
    }
});

// Initial UI state
initializeTheme();
updateCopyButtonsVisibility();
loadApiKey(); // Load API key from storage

if (imagePreview && (!imagePreview.src || imagePreview.src === '#') || imagePreview.classList.contains('hidden')) {
    imagePreview.classList.remove('clickable-preview');
    if (zoomIconOverlay) zoomIconOverlay.classList.add('hidden');
} else if (imagePreview && imagePreview.src && imagePreview.src !== '#') {
    imagePreview.classList.add('clickable-preview');
    if (zoomIconOverlay) zoomIconOverlay.classList.remove('hidden');
}
