import QRCode from 'qrcode';

// 生成二维码
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw error;
  }
};

// 生成3寸标签图片（二维码 + 文字）
export const generateLabelImage = async (data: string): Promise<string> => {
  try {
    // 3寸标签尺寸：300x400像素（300DPI下约76mm x 102mm）
    const canvasWidth = 300;
    const canvasHeight = 400;
    const qrSize = 200; // 二维码大小

    // 创建Canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }

    // 设置白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 生成二维码
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: qrSize,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // 创建二维码图片对象
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      qrImage.onload = () => {
        try {
          // 计算二维码位置（居中，上方留出一些间距）
          const qrX = (canvasWidth - qrSize) / 2;
          const qrY = 80; // 上方留30像素间距

          // 绘制二维码
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // 绘制文字
          const textY = qrY + qrSize + 20; // 二维码下方20像素间距

          // 设置文字样式
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 主文字："安全员信息码"
          ctx.font = 'bold 20px "Microsoft YaHei", Arial, sans-serif';
          ctx.fillText('安全员信息码', canvasWidth / 2, textY + 20);

          // 副文字："扫码查看详情"
          // ctx.font = '16px "Microsoft YaHei", Arial, sans-serif';
          // ctx.fillStyle = '#666666';
          // ctx.fillText('扫码查看详情', canvasWidth / 2, textY + 50);

          // 转换为DataURL
          const labelDataURL = canvas.toDataURL('image/png', 1.0);
          resolve(labelDataURL);
        } catch (error) {
          reject(error);
        }
      };

      qrImage.onerror = () => {
        reject(new Error('二维码图片加载失败'));
      };

      qrImage.src = qrCodeDataURL;
    });
  } catch (error) {
    console.error('生成标签图片失败:', error);
    throw error;
  }
};

// 下载二维码
export const downloadQRCode = (dataURL: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${filename}_qrcode.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 从base64二维码生成标签图片
export const generateLabelImageFromBase64 = async (qrCodeBase64: string): Promise<string> => {
  try {
    // 3寸标签尺寸：300x400像素（300DPI下约76mm x 102mm）
    const canvasWidth = 300;
    const canvasHeight = 400;
    const qrSize = 200; // 二维码大小

    // 创建Canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }

    // 设置白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 创建二维码图片对象
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      qrImage.onload = () => {
        try {
          // 计算二维码位置（居中，上方留出一些间距）
          const qrX = (canvasWidth - qrSize) / 2;
          const qrY = 80; // 上方留30像素间距

          // 绘制二维码
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // 绘制文字
          const textY = qrY + qrSize + 20; // 二维码下方20像素间距

          // 设置文字样式
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 主文字："安全员信息码"
          ctx.font = 'bold 20px "Microsoft YaHei", Arial, sans-serif';
          ctx.fillText('安全员信息码', canvasWidth / 2, textY + 20);

          // 转换为DataURL
          const labelDataURL = canvas.toDataURL('image/png', 1.0);
          resolve(labelDataURL);
        } catch (error) {
          reject(error);
        }
      };

      qrImage.onerror = () => {
        reject(new Error('二维码图片加载失败'));
      };

      // 处理base64数据，确保格式正确
      let base64Data = qrCodeBase64;
      if (!base64Data.startsWith('data:')) {
        base64Data = `data:image/png;base64,${base64Data}`;
      }
      qrImage.src = base64Data;
    });
  } catch (error) {
    console.error('从base64生成标签图片失败:', error);
    throw error;
  }
};

// 下载标签图片
export const downloadLabelImage = (dataURL: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${filename}_标签.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 