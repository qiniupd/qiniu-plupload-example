    var Local = window.Local || {};

    Local.storageUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
    Local.storageHex = 1024;

    Local.format = function(num, hex, units, dec, forTable) {
        num = num || 0;
        dec = dec || 0;
        forTable = forTable || false;
        var level = 0;

        // 详细报表中表格数据的最小单位为 KB 和 万次
        if (forTable) {
            num /= hex;
            level++;
        }
        while (num >= hex) {
            num /= hex;
            level++;
        }

        if (level === 0) {
            dec = 0;
        }

        return {
            'base': num.toFixed(dec),
            'unit': units[level],
            'format': function(sep) {
                sep = sep || '';
                return this.base + sep + this.unit;
            }
        };
    };

    Local.IE = (function() {
        var v = 4,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');
        while (
            div.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->',
            all[0]
        ) {
            v++;
        }
        return v > 4 ? v : false;
    }());

    Local.uploaderRuntime = Local.IE && Local.IE < 10 ? 'flash' : 'html5,flash';
    console.log(Local.uploaderRuntime);

    var uploader = new plupload.Uploader({
        runtimes: 'html5,flash',
        browse_button: 'pickfiles',
        container: 'container',
        max_file_size: '40mb',
        url: 'http://up.qiniu.com',
        flash_swf_url: 'js/plupload/Moxie.swf',
        silverlight_xap_url: 'js/plupload/Moxie.xap',
        multipart_params: {
            "token": 'MX-bE11GUuO8WUqfv1kt69hNiJ2BeI3xeKYnZqMl:nyM055VliIdALnCy9vHhHsxnbyk=:eyJzY29wZSI6InFpbml1LXBsdXBsb2FkLWV4YW1wbGUiLCJkZWFkbGluZSI6MzkwOTYyNTkzN30='
        }
    });

    uploader.bind('Init', function(up, params) {
        //显示当前上传方式，调试用
        console.log('Current runtime:  ' + params.runtime);
    });
    uploader.init();

    uploader.bind('FilesAdded', function(up, files) {
        $.each(files, function(i, file) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            progress.setStatus("等待...");
            progress.toggleCancel(true, uploader);
            up.start();
        });
        up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.bind('BeforeUpload', function(up, file) {
        var progress = new FileProgress(file, 'fsUploadProgress');
        up.settings.multipart_params.key = file.name;
    });

    uploader.bind('UploadProgress', function(up, file) {
        var progress = new FileProgress(file, 'fsUploadProgress');
        progress.setProgress(file.percent + "%", up.total.bytesPerSec);
        progress.setStatus("上传中...", true);
    });

    uploader.bind('Error', function(up, err) {
        var file = err.file;
        var errTip = '';
        if (file) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            progress.setError();
            switch (err.code) {
                case plupload.FAILED:
                    errTip = '上传失败';
                    break;
                case plupload.FILE_SIZE_ERROR:
                    errTip = '超过500M的文件请使用命令行或其他工具上传';
                    break;
                case plupload.FILE_EXTENSION_ERROR:
                    errTip = '非法的文件类型';
                    break;
                case plupload.HTTP_ERROR:
                    switch (err.status) {
                        case 400:
                            errTip = "请求参数错误";
                            break;
                        case 401:
                            errTip = "认证授权失败";
                            break;
                        case 405:
                            errTip = "请求方式错误，非预期的请求方式";
                            break;
                        case 579:
                            errTip = "文件上传成功，但是回调（callback app-server）失败";
                            break;
                        case 599:
                            errTip = "服务端操作失败";
                            break;
                        case 614:
                            errTip = "文件已存在";
                            break;
                        case 631:
                            errTip = "指定的存储空间（Bucket）不存在";
                            break;
                        default:
                            errTip = "其他HTTP_ERROR";
                            break;
                    }
                    break;
                case plupload.SECURITY_ERROR:
                    errTip = '安全错误';
                    break;
                case plupload.GENERIC_ERROR:
                    errTip = '通用错误';
                    break;
                case plupload.IO_ERROR:
                    errTip = '上传失败。请稍后重试';
                    break;
                case plupload.INIT_ERROR:
                    errTip = '配置错误';
                    uploader.destroy();
                    break;
                default:
                    errTip = err.message + err.details;
                    break;
            }
            progress.setStatus(errTip);
            progress.setCancelled();
        }
        up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.bind('FileUploaded', function(up, file) {
        var progress = new FileProgress(file, 'fsUploadProgress');
        progress.setComplete();
        progress.setStatus("上传完成");
        progress.toggleCancel(false);
    });

    uploader.bind('UploadComplete', function(up, files) {

    });

    var cancelUpload = function() {
        uploader.destroy();
        model.manualCancel(true);
    };
