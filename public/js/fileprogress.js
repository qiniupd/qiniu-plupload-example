/*
	A simple class for displaying file information and progress
	Note: This is a demonstration only and not part of SWFUpload.
	Note: Some have had problems adapting this class in IE7. It may not be suitable for your application.
*/

// Constructor
// file is a SWFUpload file object
// targetID is the HTML element id attribute that the FileProgress HTML structure will be added to.
// Instantiating a new FileProgress object with an existing file will reuse/update the existing DOM elements

/* global plupload */
/* plupload is defined in add-on/plupload/plupload.full.min.js */

function FileProgress(file, targetID) {
    this.fileProgressID = file.id;
    this.file = file;

    this.opacity = 100;
    this.height = 0;
    this.fileProgressWrapper = document.getElementById(this.fileProgressID);
    if (!this.fileProgressWrapper) {
        this.fileProgressWrapper = document.createElement("div");
        this.fileProgressWrapper.className = "progressWrapper";
        this.fileProgressWrapper.id = this.fileProgressID;

        this.fileProgressElement = document.createElement("div");
        this.fileProgressElement.className = "progressContainer";

        var progressCancel = document.createElement("a");
        progressCancel.className = "progressCancel";
        progressCancel.href = "#";
        progressCancel.style.visibility = "hidden";
        progressCancel.appendChild(document.createTextNode(" "));

        var progressText = document.createElement("div");
        progressText.className = "progressName";
        progressText.appendChild(document.createTextNode(file.name));

        var fileSize;
        var _500MB = 500 << 20;
        if (file.size === undefined || file.size > _500MB) {
            fileSize = ">500 MB";
        } else {
            var size = Local.format(file.size, Local.storageHex, Local.storageUnits, 2);
            fileSize = size.base + " " + size.unit;
        }
        var progressSize = document.createElement("div");
        progressSize.className = "progressFileSize";
        progressSize.appendChild(document.createTextNode(fileSize));

        var progressBar = document.createElement("div");
        progressBar.className = "progressBarInProgress";

        var progressStatus = document.createElement("div");
        progressStatus.className = "progressBarStatus";
        progressStatus.innerHTML = "&nbsp;";

        var progressUpSize = document.createElement("div");
        progressUpSize.className = "progressUpSize";
        progressUpSize.innerHTML = "&nbsp;";

        this.fileProgressElement.appendChild(progressCancel);
        this.fileProgressElement.appendChild(progressText);
        this.fileProgressElement.appendChild(progressStatus);
        this.fileProgressElement.appendChild(progressBar);
        this.fileProgressElement.appendChild(progressSize);
        this.fileProgressElement.appendChild(progressUpSize);

        this.fileProgressWrapper.appendChild(this.fileProgressElement);
        document.getElementById(targetID).appendChild(this.fileProgressWrapper);
    } else {
        this.fileProgressElement = this.fileProgressWrapper.firstChild;
        this.reset();
    }

    this.height = this.fileProgressWrapper.offsetHeight;
    this.setTimer(null);
}

FileProgress.prototype.setTimer = function(timer) {
    this.fileProgressElement.FP_TIMER = timer;
};
FileProgress.prototype.getTimer = function(timer) {
    return this.fileProgressElement.FP_TIMER || null;
};

FileProgress.prototype.reset = function() {
    this.fileProgressElement.className = "progressContainer";

    this.fileProgressElement.childNodes[2].innerHTML = "&nbsp;";
    this.fileProgressElement.childNodes[2].className = "progressBarStatus";

    this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
    this.fileProgressElement.childNodes[3].style.width = "0%";

    this.fileProgressElement.childNodes[5].className = "progressUpSize";
    this.fileProgressElement.childNodes[5].innerHTML = "&nbsp;";

    this.appear();
};

FileProgress.prototype.setProgress = function(percentage, speed) {
    this.fileProgressElement.className = "progressContainer green";
    this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
    this.fileProgressElement.childNodes[3].style.width = percentage;
    var size = Local.format(this.file.loaded, Local.storageHex, Local.storageUnits, 2);
    speed = Local.format(speed, Local.storageHex, Local.storageUnits, 2);
    this.fileProgressElement.childNodes[2].className = "progressBarStatus";
    this.fileProgressElement.childNodes[2].innerHTML = "已上传: " + size.base + size.unit + " 上传速度： " + speed.base + speed.unit + "/s";

    this.fileProgressElement.childNodes[5].className = "progressUpSize";
    this.fileProgressElement.childNodes[5].innerHTML = percentage;

    this.appear();
};
FileProgress.prototype.setComplete = function() {
    this.fileProgressElement.className = "progressContainer blue";
    this.fileProgressElement.childNodes[3].className = "progressBarComplete";
    this.fileProgressElement.childNodes[3].style.width = "";

    var oSelf = this;
    this.setTimer(setTimeout(function() {
        oSelf.disappear();
    }, 10000));
};
FileProgress.prototype.setError = function() {
    this.fileProgressElement.className = "progressContainer red";
    this.fileProgressElement.childNodes[3].className = "progressBarError";
    this.fileProgressElement.childNodes[3].style.width = "";
};
FileProgress.prototype.setCancelled = function(manual) {
    var progressContainer = 'progressContainer';
    if (!manual) {
        progressContainer += ' red';
    }
    this.fileProgressElement.className = progressContainer;
    this.fileProgressElement.childNodes[3].className = "progressBarError";
    this.fileProgressElement.childNodes[3].style.width = "";

    var oSelf = this;
    this.setTimer(setTimeout(function() {
        oSelf.disappear();
    }, 10000));
};
FileProgress.prototype.setStatus = function(status, isUploading) {
    if (!isUploading) {
        this.fileProgressElement.childNodes[2].innerHTML = status;
    }
};

// Show/Hide the cancel button
FileProgress.prototype.toggleCancel = function(show, up) {
    var self = this;
    self.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
    if (up) {
        // var fileID = self.fileProgressID; // TODO: 不知道有什么用，never used

        self.fileProgressElement.childNodes[0].onclick = function() {
            //绑定事件 取消当前上传文件
            self.setCancelled();
            self.setStatus("取消上传");
            var status_before = self.file.status;
            up.removeFile(self.file);
            if (up.state === plupload.STARTED && status_before === plupload.UPLOADING) {
                up.stop();
                up.start();
            }
            return true;
        };
    }

};

FileProgress.prototype.appear = function() {
    if (this.getTimer() !== null) {
        clearTimeout(this.getTimer());
        this.setTimer(null);
    }

    if (this.fileProgressWrapper.filters) {
        try {
            this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
        } catch (e) {
            // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
            this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
        }
    } else {
        this.fileProgressWrapper.style.opacity = 1;
    }

    this.fileProgressWrapper.style.height = "";

    this.height = this.fileProgressWrapper.offsetHeight;
    this.opacity = 100;
    this.fileProgressWrapper.style.display = "";

};

// Fades out and clips away the FileProgress box.
FileProgress.prototype.disappear = function() {

    var reduceOpacityBy = 15;
    var reduceHeightBy = 4;
    var rate = 30; // 15 fps
    if (this.opacity > 0) {
        this.opacity -= reduceOpacityBy;
        if (this.opacity < 0) {
            this.opacity = 0;
        }

        if (this.fileProgressWrapper.filters) {
            try {
                this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = this.opacity;
            } catch (e) {
                // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
                this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + this.opacity + ")";
            }
        } else {
            this.fileProgressWrapper.style.opacity = this.opacity / 100;
        }
    }

    if (this.height > 0) {
        this.height -= reduceHeightBy;
        if (this.height < 0) {
            this.height = 0;
        }

        this.fileProgressWrapper.style.height = this.height + "px";
    }

    if (this.height > 0 || this.opacity > 0) {
        var oSelf = this;
        this.setTimer(setTimeout(function() {
            oSelf.disappear();
        }, rate));
    } else {
        this.fileProgressWrapper.style.display = "none";
        this.setTimer(null);
    }
};
