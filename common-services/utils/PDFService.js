const DSUService = require('../services/DSUService.js');
const FileDownloaderService = require('./FileDownloaderService.js');
const {getDidServiceInstance} = require("../services/DidService.js");

class PDFService extends DSUService {
    touchListenersLoaded = false;
    canvases = [];
    targetIdx = null;

    constructor(DSUStorage) {
        super();

        this.DSUStorage = DSUStorage;
        this.fileDownloaderService = new FileDownloaderService(DSUStorage);
        this.DidServiceInstance = getDidServiceInstance();

        this.pdfModel = {
            currentPage: 1,
            pagesNo: 0
        };
    }

    onFileReadComplete(callback) {
        if (this.isFileRead) {
            return callback();
        }

        this.fileReadCallback = callback;
    }

    triggerFileReadComplete() {
        if (this.fileReadCallback) {
            return this.fileReadCallback();
        }

        this.isFileRead = true;
    }

    async displayPDF(filePath, fileName, options) {
        if (!options) {
            options = {};
        }
        this.pdfModel = {...this.pdfModel, ...options};

        await this._preparePdfFile(filePath, fileName);
        const pdfData = await this.asyncMyFunction(this._loadPdfFile, []);
        this._initPDF(pdfData);
    };

    async applyDigitalSignature(signatureOptions) {
        let {path, version, signatureAuthor, signatureDate, signatureDid, isBottomSide} = signatureOptions
        if (!this.blob) {
            await this._preparePdfFile(path, version);
        }

        const pdfData = await this.asyncMyFunction(this._loadPdfFile, []);
        if (!signatureDid) {
            signatureDid = await this.DidServiceInstance.getDID();
        }

        const signedPdfBuffer = await this._signPDF(pdfData, [signatureDid, signatureAuthor, signatureDate], isBottomSide);
        await this.writeFileAsync(`${path}/${version}`, $$.Buffer.from(signedPdfBuffer));
    }

    async _preparePdfFile(filePath, fileName) {
        await this.fileDownloaderService.prepareDownloadFromDsu(filePath, fileName);
        let fileBlob = this.fileDownloaderService.getFileBlob(fileName);
        this.rawBlob = fileBlob.rawBlob;
        this.mimeType = fileBlob.mimeType;
        this.blob = new Blob([this.rawBlob], {
            type: this.mimeType,
        });
    }

    _loadPdfFile(callback) {
        const reader = new FileReader();
        reader.readAsDataURL(this.blob);
        reader.onloadend = () => {
            let base64data = reader.result;
            callback(undefined, base64data.substr(base64data.indexOf(',') + 1));
        };
    };

    _initPDF(pdfData) {
        pdfData = atob(pdfData);
        let pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'scripts/third-parties/pdf.worker.js';

        this.loadingTask = pdfjsLib.getDocument({data: pdfData});
        this._renderPage(this.pdfModel.currentPage);
        window.WebCardinal.loader.hidden = true;
    }

    _renderPage(pageNo) {
        this.loadingTask.promise.then(
            (pdf) => {
                this.pdfModel.pagesNo = pdf.numPages;
                pdf.getPage(pageNo).then((result) => this._handlePages(pdf, result));
            },
            (reason) => console.error(reason)
        );
    };

    async changeScale(scale) {
        const pdf = await this.loadingTask.promise;
        this.pdfModel.currentPage = 1;
        const page = await pdf.getPage(1);
        const promise = new Promise((resolve, reject) => {
            this._handlePages(pdf, page, scale, () => resolve());
        })
        return promise;
    }

    _initPinchAndZoom() {
        if (this.touchListenersLoaded) return;
        this.touchListenersLoaded = true;
        const el = document.getElementById("pdf-wrapper");

        let startX = 0, startY = 0;
        let initialPinchDistance = 0;        
        let pinchScale = 1;    
        
        const viewer = document.getElementById("canvas-parent");
        const reset = () => { startX = startY = initialPinchDistance = 0; pinchScale = 1; };

        // Prevent native iOS page zoom
        //document.addEventListener("touchmove", (e) => { if (e.scale !== 1) { e.preventDefault(); } }, { passive: false });

        el.addEventListener("touchstart", (e) => {
            if (e.touches.length > 1) {
                startX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
                startY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
                initialPinchDistance = Math.hypot((e.touches[1].pageX - e.touches[0].pageX), (e.touches[1].pageY - e.touches[0].pageY));
            } else {
                initialPinchDistance = 0;
            }
        });
        el.addEventListener("touchmove", (e) => {
            const container = e.path[0];
            this.targetIdx = this.canvases.findIndex(x => x === container);
            if (initialPinchDistance <= 0 || e.touches.length < 2) { return; }
            if (e.scale !== 1) { e.preventDefault(); }
            const pinchDistance = Math.hypot((e.touches[1].pageX - e.touches[0].pageX), (e.touches[1].pageY - e.touches[0].pageY));
            const originX = startX + container.scrollLeft;
            const originY = startY + container.scrollTop;
            pinchScale = pinchDistance / initialPinchDistance;
            viewer.style.transform = `scale(${pinchScale })`;
            viewer.style.transformOrigin = `${originX}px ${originY}px`;
        }, { passive: false });
        el.addEventListener("touchend", async (e) => {
            
            if (initialPinchDistance <= 0) { return; }
            viewer.style.transform = `none`;
            viewer.style.transformOrigin = `unset`;
            this.changeScale(pinchScale);
            const container = document.getElementById('canvas-parent');
            const child = container.children.item(0);
            const rect = container.getBoundingClientRect();
            const dx = startX - rect.left;
            const dy = startY - rect.top + this.targetIdx * child.getBoundingClientRect().height;
            container.scrollLeft += dx * (pinchScale - 1);
            container.scrollTop += dy * (pinchScale - 1);
            reset();
        });
    }

    _handlePages(thePDF, page, manualScale, callback) {
        const scale = manualScale ? manualScale : this.pdfModel.scale || 1.2;
        const viewport = page.getViewport({scale: scale});
        let canvas =  document.createElement('canvas');
        canvas.style.display = 'block';
        let context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({canvasContext: context, viewport: viewport});
        const parent = document.getElementById('canvas-parent');
        if (this.canvases[this.pdfModel.currentPage - 1]) {
            parent.replaceChild(canvas, this.canvases[this.pdfModel.currentPage - 1]);
            this.canvases[this.pdfModel.currentPage - 1] = parent.children.item(this.pdfModel.currentPage - 1);

        } else {
            this.canvases.push(parent.appendChild(canvas));
        }

        this.pdfModel.currentPage = this.pdfModel.currentPage + 1;
        let currPage = this.pdfModel.currentPage;
        if (thePDF !== null && currPage <= this.pdfModel.pagesNo) {
            thePDF.getPage(currPage).then((result) => this._handlePages(thePDF, result, scale, callback));
        }

        const pdfWrapper = document.getElementById("pdf-wrapper");
        let checkOffset = (container) => {
            if (Math.ceil(container.offsetHeight + container.scrollTop) >= container.scrollHeight) {
                this.triggerFileReadComplete();
            }
        }

        window.addEventListener("scroll", (event) => {
            if (event.target === pdfWrapper) {
                checkOffset(pdfWrapper);
            }
        }, {capture: true});

        checkOffset(pdfWrapper);
        this._initPinchAndZoom();
        if (thePDF !== null && currPage > this.pdfModel.pagesNo && callback) {
            callback();
        }
    };

    async _signPDF(base64PdfData, signatureLines, isBottomSide = false) {
        const {PDFDocument, rgb, StandardFonts} = PDFLib
        const pdfDoc = await PDFDocument.load(base64PdfData);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];

        const textSize = 10;
        const lineHeight = textSize + 2;
        const offsetX = 40;
        const offsetY = 100 + (isBottomSide ? - 45 : 0);
        const paddingX = 5;
        const paddingY = 5;

        let maxLengthIndex = 0;
        signatureLines.forEach((line, lineIndex) => {
            if (line.length > signatureLines[maxLengthIndex]) {
                maxLengthIndex = lineIndex;
            }

            lastPage.drawText(line, {
                x: offsetX,
                y: offsetY + (lineHeight * lineIndex),
                size: textSize,
                font: helveticaFont,
                color: rgb(0, 135 / 255, 152 / 255)
            });
        });

        const textWidth = helveticaFont.widthOfTextAtSize(signatureLines[maxLengthIndex], textSize);
        const textHeight = helveticaFont.heightAtSize(textSize);
        lastPage.drawRectangle({
            x: offsetX - paddingX,
            y: offsetY - paddingY,
            width: textWidth + (paddingY * 2),
            height: (textHeight * signatureLines.length) + (paddingX * 2.5),
            borderWidth: 1,
            borderColor: rgb(0, 135 / 255, 152 / 255)
        });

        return await pdfDoc.save();
    }
}

module.exports = PDFService;