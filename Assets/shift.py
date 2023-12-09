from PIL import Image
import shutil
import os

def shift_image_up_and_backup(image_path, shift_pixels):
    # 打开图像
    original_image = Image.open(image_path)

    # 获取图像的宽度和高度
    width, height = original_image.size

    # 创建新的图像，背景为透明
    new_image = Image.new('RGBA', (width, height), (0, 0, 0, 0))

    # 将原始图像粘贴到新图像中，向上偏移指定像素
    new_image.paste(original_image, (0, -shift_pixels))

    # 备份原始图像
    backup_path = image_path + ".bak"
    shutil.copy2(image_path, backup_path)

    # 覆盖原始图像
    new_image.save(image_path)

if __name__ == "__main__":
    # 从命令行参数中获取图像路径和向上偏移的像素数
    import sys
    if len(sys.argv) != 3:
        print("Usage: python script.py <image_path> <shift_pixels>")
        sys.exit(1)

    image_path = sys.argv[1]
    shift_pixels = int(sys.argv[2])

    # 执行图像向上偏移的操作并备份原始图像
    shift_image_up_and_backup(image_path, shift_pixels)
