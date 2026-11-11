
import sys                             
import re            
import json                   
div_template =\
"""
<div class="classBox {dept}" id="{dept}{code}" style="left: {x}em; top: {y}em;" prereq="{prereqs}">
    <span class="course-code-full">{dept_upper} {code} ({credit:.2f})</span><br>
    <span class="course-name" style="font-size:{name_font_size};">{name}</span>
    <div class="course-description" hidden="hidden">{full_description}</div>
</div>
"""
class Course:
    def __init__(self, dept, code, credit, name, prereqs, desc):
        self.dept = dept                                         
        self.code = code                                                                                                               
        self.credit = credit                                                                                                                                     
        self.name = name                                                          
        self.prereqs = prereqs                                                                                                               
        self.desc = desc

    def generate_div_element(self, x, y):
        prereqs = " ".join([(i[0] + i[1]) for i in self.prereqs])
        name_font_size = "0.9em" if len(self.name) > 60 else "1.0em"
        return div_template.format(
            dept = self.dept,
            code = self.code,
            x = x,
            y = y,
            prereqs = prereqs,
            credit = self.credit,
            name_font_size = name_font_size,
            name = self.name,
            dept_upper = self.dept.upper(),
            full_description=self.desc)
    def get_code_tuple(self):
        return (self.dept, self.code)
def generate_2(courses, box_width, box_height, horizontal_gap, vertical_gap, base_margin_horizontal, base_margin_vertical, col_count=6):
    years_list = {}
    for key in courses:
        year = int(key[1][0])                                                                        
        if year not in years_list:                                                   
            years_list[year] = [[], []]
        course = courses[key]
        is_second_sem = False
        for prereq in course.prereqs:
            if int(prereq[1][0]) == year:                                              
                is_second_sem = True
        if not is_second_sem:
            years_list[year][0].append(course)                              
        else:
            years_list[year][1].append(course)                
    current_col = 0
    current_row = 0
    coordinate_list = {}                          
    for year in years_list:                
        for sem in years_list[year]:                    
            for course in sem:                                   
                if current_col >= col_count:                                                       
                    current_row += 1
                    current_col = 0
                code_tuple = course.get_code_tuple()                            
                coordinate_list[code_tuple] = (current_col, current_row)
                current_col += 1              
            current_row += 1
            current_col = 0
        current_row += 1
        current_col = 0
    res = ""
    for code in coordinate_list:
        course = courses[code]
        x = coordinate_list[code][0] * (box_width + horizontal_gap) + base_margin_horizontal
        y = coordinate_list[code][1] * (box_height + vertical_gap) + base_margin_vertical
        div = course.generate_div_element(x, y)
        res += div
    return res, current_row
def read_json(content):
    items = json.loads(content)
    items = items["courses"]
    res = {}
    for item in items:
        dept = item["dept"]
        code = item["code"]
        credit = item["credit"]
        name = item["name"]
        prereqs = item["prereq"]
        preq_list = []
        if prereqs != "":
            prereqs = prereqs.split(" ")
            for prereq in prereqs:
                nums = re.findall("[0-9]", prereq)                                                                                          
                mark = prereq.find(nums[0])                                      
                pdept = prereq[:mark]                                                       
                pcode = prereq[mark:]
                preq_list.append((pdept, pcode))                 
        desc = item["desc"]
        res[(dept, code)] = Course(dept, code, credit, name, preq_list, desc)
    return res

def main():
    args = sys.argv                             
    input_fil = args[1]                                 
    output_fil = args[2] if len(args) >= 3 else "generated.html"                                       

    input_open = open(input_fil, "r")
    content = input_open.read()                       

    courses_list = read_json(content)                                   
    box_width = 12
    box_height = 4.5
    horizontal_gap = 2
    vertical_gap = 2.5
    base_margin_horizontal = 2
    base_margin_vertical = 2
    col_count = 6
    html_output, total_row_ct = generate_2(courses_list, box_width, box_height, horizontal_gap, vertical_gap, base_margin_horizontal, base_margin_vertical, col_count)                         
    index_template = open("template_new.html").read()
    final_output = index_template.replace("{{- courses_divs -}}", html_output)
    final_output = final_output.replace("{{- root_div_base_width -}}", f"{(box_width + horizontal_gap) * col_count - horizontal_gap + 2 * base_margin_horizontal}em")
    final_output = final_output.replace("{{- root_div_base_height -}}", f"{(box_height + vertical_gap) * total_row_ct - vertical_gap + 2 * base_margin_vertical}em")

    fil = open(output_fil, "w")
    fil.write(final_output)
if __name__ == '__main__':
    main()
