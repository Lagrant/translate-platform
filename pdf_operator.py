from PyPDF2 import PdfFileReader, PdfFileMerger, PdfFileWriter
import os
def merge(file_path_list):
        """
        merge the given file
        """
        print('There are ' + str(len(file_path_list)) + ' pdfs to be merged')
        pdf_merge = PdfFileMerger()

        for file_path in file_path_list:
            print('merging ' + str(file_path))
            pdf_merge.append(file_path)

        out_file = os.path.join(os.path.split(file_path_list[0])[0], 'merge-' + str(int(time.time())) + '.pdf')
        pdf_merge.write(out_file)

        print('save the merged pdf to ' + str(out_file))
        pass

def merge_all(path):
        """
        merge all the files under a directory
        """
        pdf_path_list = []
        file_list = os.listdir(path)
        for file in file_list:
            file_path = os.path.join(path, file)
            if os.path.isdir(file_path):
                continue
            file_type = os.path.splitext(file_path)[1]
            if file_type != '.pdf':
                continue
            pdf_path_list.append(file_path)
        PDFHelper.merge(pdf_path_list)
        pass

def split(pdf_path, index_list):
        
        pdf_reader = PdfFileReader(pdf_path)
        page_num = pdf_reader.getNumPages()
        index_list.append(page_num-1)
        start = 0

        print('spliting pdf ' + pdf_path + ' to ' + str(len(index_list)) + ' parts')

        for index in index_list:
            index = int(index)
            if index <= 0 or index >= page_num or index < start:
                continue
            pdf_writer = PdfFileWriter()
            for i in range(start, index+1):
                pdf_writer.addPage(pdf_reader.getPage(i))
            # 获取PDF所在目录和PDF文件名
            pdf_dir = os.path.split(pdf_path)[0]
            pdf_name = os.path.splitext(os.path.split(pdf_path)[1])[0]
            # 保存分割的PDF
            out_file = os.path.join(pdf_dir, pdf_name + '--' + str(start) + '-' + str(index) + '.pdf')
            pdf_writer.write(open(out_file, 'wb'))

            print('save the splited pdf from page ' + str(start) + ' to ' + str(index) + ' to ' + str(out_file))

            start = index + 1;
        pass

if __name__ == '__main__':
    index_list = [2,5]
    split('./static/uploads/A_two-dimensional_interpolation_for_irregularly-spaced_data_.pdf', index_list)
