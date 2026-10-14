(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VibeResumeRules = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const RULES = [
    ["familyName", /(家庭成员姓名|家属姓名|亲属姓名|family[\s_-]*member[\s_-]*name)/i],
    ["familyRelationship", /(与本人关系|家庭关系|亲属关系|家属关系|relationship[\s_-]*to[\s_-]*(you|applicant))/i],
    ["familyPhone", /(家庭成员|家属|亲属).{0,8}(手机|电话|联系方式)|family[\s_-]*(phone|mobile|contact)/i],
    ["familyCompany", /(家庭成员|家属|亲属).{0,8}(工作单位|单位|公司)|family[\s_-]*(company|employer|work[\s_-]*unit)/i],
    ["familyPosition", /(家庭成员|家属|亲属).{0,8}(职务|职业|岗位)|family[\s_-]*(position|occupation|job)/i],
    ["fullName", /(^|\b)(姓名|真实姓名|中文名|name|full[\s_-]*name)(\b|$)/i],
    ["firstName", /(^(名|名字)$|first[\s_-]*name|given[\s_-]*name)/i],
    ["lastName", /(姓|last[\s_-]*name|family[\s_-]*name|surname)/i],
    ["phone", /(手机|手机号|联系电话|移动电话|phone|mobile|tel)/i],
    ["email", /(邮箱|常用邮箱|邮件地址|电子邮件|电子邮箱|e[\s_-]*mail)/i],
    ["gender", /(性别|gender|sex)/i],
    ["maritalStatus", /(婚姻状况|婚姻状态|婚否|marital[\s_-]*status)/i],
    ["nationality", /(国籍|国家|nationality|citizenship)/i],
    ["birthDate", /(出生日期|出生年月日|出生年月|出生时间|生日|birth|birthday|date[\s_-]*of[\s_-]*birth)/i],
    ["ethnicity", /(民族|族别|ethnicity|ethnic[\s_-]*group)/i],
    ["nativePlace", /(籍贯|原籍|native[\s_-]*place|hometown)/i],
    ["politicalStatus", /(政治面貌|政治身份|political[\s_-]*status|political[\s_-]*affiliation)/i],
    ["expectedCity", /(期望工作城市|意向城市|目标城市|工作地点|preferred[\s_-]*(city|location))/i],
    ["city", /(现居住地|现居地|所在城市|居住城市|工作城市|location|current[\s_-]*city|city)/i],
    ["address", /(联系地址|现居地址|详细地址|address)/i],
    ["idNumber", /(身份证号|证件号码|identity|id[\s_-]*(card|number))/i],
    ["idType", /(证件类型|证件种类|document[\s_-]*type|id[\s_-]*type)/i],
    ["householdRegistration", /(户籍所在地|户口所在地|户籍|户口|household[\s_-]*registration)/i],
    ["wechat", /(微信号|微信|wechat)/i],
    ["qq", /(^|\b)(qq号|qq)(\b|$)/i],
    ["jobStatus", /(求职状态|在职状态|当前工作状态|job[\s_-]*status|employment[\s_-]*status)/i],
    ["workYears", /(工作年限|工作经验年限|工龄|years?[\s_-]*of[\s_-]*experience)/i],
    ["workNature", /(工作性质|用工性质|全职或兼职|employment[\s_-]*type|job[\s_-]*type)/i],
    ["expectedIndustry", /(期望行业|意向行业|目标行业|preferred[\s_-]*industry)/i],
    ["internshipCompany", /(实习(公司|单位|企业)|实习经历[\s_-]*(公司|单位)|internship[\s_-]*(company|employer))/i],
    ["internshipPosition", /(实习(岗位|职位|职务)|internship[\s_-]*(position|title|role))/i],
    ["internshipStartDate", /(实习(开始|起始|入职)时间|internship[\s_-]*start)/i],
    ["internshipEndDate", /(实习(结束|截止|离职)时间|internship[\s_-]*end)/i],
    ["internshipDescription", /(实习(内容|描述|职责|成果)|实习工作内容|internship[\s_-]*(description|responsibilities|achievements))/i],
    ["jobTitle", /(应聘职位|申请职位|期望职位|目标岗位|job[\s_-]*title|position)/i],
    ["salary", /(期望薪资|薪资要求|expected[\s_-]*salary|salary)/i],
    ["availableDate", /(到岗时间|可入职时间|入职日期|available[\s_-]*date)/i],
    ["cet6Score", /(英语六级(成绩|分数)?|大学英语六级(成绩|分数)?|六级(成绩|分数)|CET[\s_-]*6([\s_-]*(score|grade))?)/i],
    ["englishScore", /(英语成绩|英语考试成绩|外语成绩|雅思成绩|托福成绩|english[\s_-]*(score|grade)|language[\s_-]*score|ielts[\s_-]*score|toefl[\s_-]*score)/i],
    ["school", /(毕业院校|学校名称|院校|学校|university|college|school)/i],
    ["researchDirection", /(研究方向|研究领域|科研方向|学术方向|research[\s_-]*(direction|area|interest|field|focus)|area[\s_-]*of[\s_-]*research)/i],
    ["major", /(专业名称|所学专业|专业|major|field[\s_-]*of[\s_-]*study)/i],
    ["academicDegree", /(所获学位|学位名称|(^|\s)学位($|\s)|academic[\s_-]*degree)/i],
    ["degree", /(学历|学历阶段|最高学历|degree|education[\s_-]*level)/i],
    ["startDate", /(入学时间|入学日期|开始时间|enrollment|start[\s_-]*date)/i],
    ["graduationDate", /(毕业时间|毕业日期|graduation)/i],
    ["gpa", /(^|\b)(绩点|平均成绩|gpa)(\b|$)/i],
    ["classRank", /(专业排名|班级排名|院系排名|综合排名|成绩排名|class[\s_-]*rank|academic[\s_-]*rank)/i],
    ["courses", /(主修课程|核心课程|专业课程|relevant[\s_-]*course|courses?)/i],
    ["projectName", /(项目名称|项目名|project[\s_-]*name)/i],
    ["projectRole", /(项目角色|项目职责|担任角色|project[\s_-]*(role|position))/i],
    ["projectStartDate", /(项目开始时间|项目起始时间|project[\s_-]*start)/i],
    ["projectEndDate", /(项目结束时间|项目截止时间|project[\s_-]*end)/i],
    ["projectDescription", /(项目描述|项目内容|项目成果|project[\s_-]*(description|details|achievements))/i],
    ["campusOrganization", /(社团名称|学生会|校园组织|组织名称|organization)/i],
    ["campusRole", /(校园职务|社团职务|担任职务|campus[\s_-]*role)/i],
    ["campusDescription", /(校园经历|社团经历|学生工作|校园活动|campus[\s_-]*(experience|description))/i],
    ["languageName", /(语种|外语语种|语言名称|language[\s_-]*name)/i],
    ["languageLevel", /(外语水平|语言水平|熟练程度|英语水平|language[\s_-]*(level|proficiency))/i],
    ["skillName", /(技能名称|专业技能|技术能力|skill[\s_-]*name)/i],
    ["skillLevel", /(技能水平|技能等级|掌握程度|skill[\s_-]*(level|proficiency))/i],
    ["certificateName", /(证书名称|资格证书|所获证书|certificate[\s_-]*name)/i],
    ["awardName", /(奖项名称|获奖名称|荣誉名称|award[\s_-]*name|honou?r)/i],
    ["website", /(个人主页|作品集|博客|portfolio|website|personal[\s_-]*(site|url))/i],
    ["github", /(github|代码仓库)/i],
    ["linkedin", /(linkedin|领英)/i],
    ["summary", /(自我介绍|个人简介|自我评价|个人总结|个人优势|个人陈述|职业概述|职业总结|求职信|summary|profile|about[\s_-]*me|bio|personal[\s_-]*statement|cover[\s_-]*letter)/i]
  ];

  function normalize(text) {
    return String(text || "").replace(/[：:*?（()）\[\]]/g, " ").replace(/\s+/g, " ").trim();
  }

  function matchField(text) {
    const value = normalize(text);
    if (!value) return null;
    for (const [key, pattern] of RULES) {
      if (pattern.test(value)) return key;
    }
    return null;
  }

  function profileValue(profile, key) {
    if (!profile) return "";
    if (key === "firstName" || key === "lastName") {
      const full = profile.fullName || "";
      if (profile[key]) return profile[key];
      if (/^[\u3400-\u9fff]/.test(full)) return key === "lastName" ? full.slice(0, 1) : full.slice(1);
    }
    return profile[key] == null ? "" : String(profile[key]);
  }

  return { RULES, normalize, matchField, profileValue };
});
