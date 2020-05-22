from PyPDF2 import PdfFileReader, PdfFileMerger, PdfFileWriter
import os
import time
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

def split(pdf_path, int_index_list):
        
        pdf_reader = PdfFileReader(pdf_path)
        # page_num = pdf_reader.getNumPages()

        # print('spliting pdf ' + pdf_path + ' to ' + str(len(index_list)) + ' parts')

        
        out_files = []
        for index in int_index_list:
            """    
            index = int(index)
            if index <= 0 or index >= page_num or index < start:
                continue
            """
            index[0] = index[0] - 1
            index[1] = index[1] - 1
            pdf_writer = PdfFileWriter()
            for i in range(index[0], index[1]+1):
                pdf_writer.addPage(pdf_reader.getPage(i))
            # 获取PDF所在目录和PDF文件名
            pdf_dir = os.path.split(pdf_path)[0]
            pdf_name = os.path.splitext(os.path.split(pdf_path)[1])[0]
            # 保存分割的PDF
            out_file = os.path.join(pdf_dir, pdf_name + '--' + str(index[0]) + '-' + str(index[1]) + '.pdf')
            pdf_writer.write(open(out_file, 'wb'))
            out_files.append(str(out_file))

            print('save the splited pdf from page ' + str(index[0]) + ' to ' + str(index[1]) + ' to ' + str(out_file))

        return out_files

if __name__ == '__main__':
        index_list = [[8,8]]
        split('/Users/Lagrant/Downloads/OAE_Defining_a_Term.pdf', index_list)
#        file_path_list = ["/Users/Lagrant/Downloads/IMG_2784.pdf"]
#        merge(file_path_list)
