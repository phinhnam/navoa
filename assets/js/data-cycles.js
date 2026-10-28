/* Thiên Số — Chu kỳ & bài học (đỉnh cao, thách thức, nợ nghiệp, mũi tên, bình diện) */
window.NUM = window.NUM || {};
window.NUM.cycles = {
  pinnacleIntro: 'Bốn đỉnh cao chia đời người thành bốn chương, mỗi chương mở ra một chủ đề lớn. Đây không phải lời tiên đoán mà là bản đồ nhịp điệu: biết mình đang ở chương nào để không sống bằng nhịp của chương khác.',

  pinnacles: {
    1: { title: 'Tự lập', text: 'Chương này đòi bạn đứng trên đôi chân mình: khởi đầu, dám khác, và học cách tự quyết. Cơ hội đến khi bạn chủ động; bài học đến khi bạn chờ người khác mở đường. Hãy xây một điều gì đó mang tên bạn.' },
    2: { title: 'Kết nối', text: 'Chương của quan hệ, hợp tác và kiên nhẫn. Thành tựu lớn nhất không đến từ việc một mình giỏi hơn, mà từ việc tìm đúng người để đi cùng. Học cách lắng nghe, thương lượng và giữ ranh giới.' },
    3: { title: 'Biểu đạt', text: 'Chương của tiếng nói và sáng tạo. Bạn được mời nói ra, viết ra, trình bày ra điều mình nghĩ. Niềm vui là nhiên liệu; sự tập trung là chìa khóa để niềm vui ấy thành kết quả.' },
    4: { title: 'Xây nền', text: 'Chương của kỷ luật và cấu trúc. Những gì bạn dựng trong giai đoạn này sẽ đỡ bạn trong nhiều năm sau. Hãy chọn ít việc nhưng làm cho chắc, và đừng bỏ qua sức khỏe.' },
    5: { title: 'Chuyển động', text: 'Chương của thay đổi, trải nghiệm và mở rộng. Bạn được mời bước ra khỏi vùng quen, học điều mới, gặp người mới. Tự do chỉ có ích khi bạn có một điểm neo bên trong.' },
    6: { title: 'Vun đắp', text: 'Chương của gia đình, trách nhiệm và cái đẹp. Bạn được mời chăm sóc, xây tổ ấm và chữa lành những mối quan hệ quan trọng. Bài học là cho đi mà không kiểm soát.' },
    7: { title: 'Chiêm nghiệm', text: 'Chương của chiều sâu và học hỏi. Bạn được mời quay vào trong, đặt câu hỏi lớn và phát triển chuyên môn. Sự im lặng ở giai đoạn này là đầu tư, không phải tụt lại.' },
    8: { title: 'Thu hoạch', text: 'Chương của thành tựu và quyền lực. Kết quả của nhiều năm hiện ra, và bạn được mời dùng nguồn lực mình có một cách có đạo đức. Thành công ở đây được đo bằng thứ bạn xây được cho người khác.' },
    9: { title: 'Hoàn tất', text: 'Chương của buông bỏ và tổng kết. Bạn được mời dọn dẹp, tha thứ, hoàn thành những gì còn dang dở và trao lại. Nhường chỗ là cách để chương sau bắt đầu.' },
    11: { title: 'Truyền cảm hứng', text: 'Chương của trực giác và tầm nhìn. Bạn được mời dẫn dắt bằng cảm hứng, nói ra điều người khác chưa nói được. Cần giữ năng lượng và tránh tự biến mình thành người gánh cảm xúc của tất cả.' },
    22: { title: 'Kiến tạo', text: 'Chương của công trình lớn. Bạn được mời biến tầm nhìn thành hệ thống và để lại dấu ấn bền. Hãy chia dự án thành giai đoạn và tìm người cùng xây.' },
    33: { title: 'Dạy & chữa lành', text: 'Chương của sứ mệnh nuôi dưỡng người khác. Bạn được mời dạy bằng cách sống và chữa lành bằng sự hiện diện. Ranh giới là điều kiện để làm được điều đó lâu dài.' }
  },

  challengeIntro: 'Bốn thách thức là bốn "điểm mù" lặp lại ở các giai đoạn khác nhau. Chúng không phải bản án; chúng là bài tập được giao đúng người.',
  challenges: {
    0: { title: 'Thách thức 0', text: 'Không có thử thách cố định — nghĩa là bạn được tự chọn bài học của mình. Điều này tự do nhưng cũng dễ khiến bạn trôi. Hãy chủ động đặt ra một tiêu chuẩn cho bản thân, nếu không bạn sẽ sống dưới tiềm năng mà không biết vì sao.' },
    1: { title: 'Học tự lập', text: 'Bài tập là đứng về phía mình. Bạn dễ chờ người khác cho phép, hoặc ngược lại, sợ phụ thuộc đến mức không dám nhờ. Hãy luyện những quyết định nhỏ mỗi ngày và giữ lời với chính mình.' },
    2: { title: 'Học cân bằng cảm xúc', text: 'Bài tập là không để cảm xúc của người khác quyết định giá trị của bạn. Bạn nhạy và dễ bị tổn thương bởi lời nói. Hãy học cách phản hồi chậm, gọi tên cảm xúc và không biến một lời chê thành bản án.' },
    3: { title: 'Học biểu đạt', text: 'Bài tập là nói ra điều thật, không pha trò, không vòng vo. Bạn có thể sợ bị đánh giá nên im lặng hoặc nói quá nhiều. Hãy luyện viết, nói trước gương và cho phép mình không hoàn hảo khi cất tiếng.' },
    4: { title: 'Học kỷ luật', text: 'Bài tập là sự đều đặn. Bạn dễ trì hoãn hoặc bỏ dở khi mọi thứ không còn mới. Hãy chọn một việc nhỏ và làm nó mỗi ngày trong 30 ngày — sự tự tin của bạn sẽ được xây từ đó, không phải từ cảm hứng.' },
    5: { title: 'Học tự do có trách nhiệm', text: 'Bài tập là không chạy trốn. Bạn dễ đổi hướng khi gặp khó, hoặc tìm kích thích mới để tránh cảm giác trống. Hãy học cách ở lại với một cam kết đủ lâu để thấy kết quả, và chọn tự do trong khuôn khổ.' },
    6: { title: 'Học yêu không kiểm soát', text: 'Bài tập là cho phép người khác sống theo cách của họ. Bạn dễ lo quá nhiều và gọi đó là trách nhiệm. Hãy học cách hỏi "bạn cần gì?" thay vì quyết định thay, và chấp nhận rằng mình không cứu được ai khỏi bài học của họ.' },
    7: { title: 'Học tin tưởng', text: 'Bài tập là tin vào bản thân và cuộc đời mà không cần kiểm soát mọi thứ. Bạn dễ hoài nghi, phân tích quá mức và thu mình. Hãy luyện chia sẻ một điều thật với một người tin cậy mỗi tuần.' },
    8: { title: 'Học cân bằng quyền lực & tiền bạc', text: 'Bài tập là không để thành tích định nghĩa giá trị bản thân. Bạn dễ làm quá sức hoặc đo người khác bằng kết quả. Hãy tập nghỉ mà không thấy tội lỗi, và cho đi mà không cần ghi công.' }
  },

  karmicDebtIntro: 'Nợ nghiệp xuất hiện khi tổng trung gian rơi vào 13, 14, 16 hoặc 19. Đây không phải hình phạt — đó là một kỹ năng bạn chưa được dạy đủ, và đời sẽ dạy lại bằng trải nghiệm.',
  karmicDebt: {
    13: {
      title: 'Nợ nghiệp 13/4',
      text: 'Bài học về lao động thật và sự kiên trì. Bạn dễ tìm đường tắt, bỏ dở khi việc trở nên nhàm chán, hoặc đặt gánh nặng lên người khác rồi tự ái khi bị nhắc. Con đường chuyển hóa là làm việc bằng đôi tay mình, hoàn thành những việc nhỏ, và tôn trọng quy trình. Mỗi lần bạn làm xong điều mình đã hứa, món nợ ấy vơi đi một phần.'
    },
    14: {
      title: 'Nợ nghiệp 14/5',
      text: 'Bài học về tự do có trách nhiệm. Bạn dễ lạm dụng trải nghiệm, thay đổi liên tục hoặc dùng kích thích để né những điều cần đối diện. Bạn có tài ăn nói và sức hút, nên cám dỗ cũng lớn. Chuyển hóa bằng cách chọn một vài cam kết thật, giữ chúng qua giai đoạn nhàm chán, và học cách ở lại với cảm xúc thay vì chạy.'
    },
    16: {
      title: 'Nợ nghiệp 16/7',
      text: 'Bài học về khiêm nhường và sự thật. Bạn dễ xây dựng hình ảnh, che giấu phần tối, hoặc rơi vào những mối quan hệ phức tạp vì tin vào hào nhoáng. Đời sẽ lặp lại những lần "đổ vỡ" để buộc bạn bỏ lớp mặt nạ. Chuyển hóa bằng sự trung thực triệt để và học cách ở một mình mà không thấy trống.'
    },
    19: {
      title: 'Nợ nghiệp 19/1',
      text: 'Bài học về dùng quyền lực mà không độc đoán. Bạn dễ đòi hỏi sự chú ý, khó nhận giúp đỡ, và dễ cô đơn vì tự tách mình. Tài năng của bạn thật, nhưng nếu chỉ dùng cho bản thân, nó sẽ thành gánh nặng. Chuyển hóa bằng cách xin giúp đỡ, lắng nghe phản hồi và dùng ảnh hưởng của mình để mở đường cho người khác.'
    }
  },

  arrows: {
    lines: [
      { key: '123', name: 'Mũi tên Kế hoạch', cells: [1, 2, 3], text: 'Bạn có khả năng sắp xếp, lập kế hoạch và biến ý tưởng thành lịch trình. Điểm cần học là linh hoạt khi kế hoạch đổi.', empty: { name: 'Mũi tên Thiếu định hướng', text: 'Dễ lùy kế, thiếu lộ trình rõ ràng và thường bỏ dở việc nửa chừng.' } },
      { key: '456', name: 'Mũi tên Ý chí', cells: [4, 5, 6], text: 'Bạn có sức bền và khả năng theo đuổi mục tiêu dài hơi. Cần chú ý đừng biến ý chí thành cứng nhắc.', empty: { name: 'Mũi tên Uất giận', text: 'Dễ bực bội khi gặp cản trở, cảm xúc bùng nổ khi kế hoạch bị thay đổi.' } },
      { key: '789', name: 'Mũi tên Hoạt động', cells: [7, 8, 9], text: 'Bạn có xu hướng làm trước khi bàn xong. Đó là lợi thế khi cần bứt phá, là rủi ro khi cần cân nhắc.', empty: { name: 'Mũi tên Thụ động', text: 'Thiếu sự chủ động, hay chờ người khác ra quyết định trước khi hành động.' } },
      { key: '147', name: 'Mũi tên Thực tế', cells: [1, 4, 7], text: 'Bạn giỏi nhìn vào sự thật và làm việc có hệ thống. Cần học cách cho phép những điều chưa chắc chắn.', empty: { name: 'Mũi tên Hỗn độn', text: 'Thiếu trật tự, khó tổ chức công việc theo hệ thống và hoàn tất đúng hạn.' } },
      { key: '258', name: 'Mũi tên Cân bằng', cells: [2, 5, 8], text: 'Bạn có khả năng giữ nhịp giữa cảm xúc và lý trí, giữa cho và nhận. Cần chú ý không hy sinh bản thân quá mức.', empty: { name: 'Mũi tên Nhạy cảm', text: 'Dễ bị cảm xúc của người khác chi phối, khó giữ vững sự ổn định nội tâm.' } },
      { key: '369', name: 'Mũi tên Trí tuệ', cells: [3, 6, 9], text: 'Bạn có tư duy rộng, khả năng tổng hợp và khiếu sáng tạo. Cần học cách đưa ý tưởng xuống đất.', empty: { name: 'Mũi tên Trí nhớ ngắn hạn', text: 'Dễ quên, khó tập trung và ghi nhớ thông tin trong thời gian ngắn.' } },
      { key: '159', name: 'Mũi tên Quyết tâm', cells: [1, 5, 9], text: 'Bạn có sự bền bỉ và khả năng tự thúc đẩy mạnh. Cần tránh việc tự lập đến mức không cho ai giúp.', empty: { name: 'Mũi tên Trì hoãn', text: 'Dễ hoài nghi trước quyết định lớn và trì hoãn những điều quan trọng.' } },
      { key: '357', name: 'Mũi tên Tâm linh', cells: [3, 5, 7], text: 'Bạn nhạy với ý nghĩa ẩn sau sự việc và có đời sống nội tâm phong phú. Cần học cách neo mình vào thực tế.', empty: { name: 'Mũi tên Hoài nghi', text: 'Khó tìm được ý nghĩa sâu, đời sống nội tâm chưa được nuôi dưỡng.' } }
    ],
    empty: {
      key: 'empty',
      text: 'Ba ô trống trên một đường thẳng tạo "mũi tên trống" — không phải điều xấu, mà là một kỹ năng bạn cần học bằng ý thức. Hãy xem đó là vùng đất chưa trồng, không phải vùng đất cấm.'
    }
  },

  planes: {
    intro: 'Bốn bình diện cho thấy bạn vận hành mạnh ở khía cạnh nào: thân thể, trí tuệ, cảm xúc và trực giác. Chúng là bản đồ cách bạn tiếp nhận và phản hồi với thế giới xung quanh.',
    list: [
      { key: 'physical', name: 'Bình diện Thân thể', letters: ['E', 'W', 'D', 'M'], text: 'Cách bạn hiện diện trong thế giới vật chất: sức bền, hành động, khả năng biến ý tưởng thành việc thực. Mạnh ở đây nghĩa là bạn làm được, chịu được và thấy kết quả rõ. Yếu ở đây nghĩa là ý tưởng nhiều nhưng tay chân chậm.' },
      { key: 'mental', name: 'Bình diện Trí tuệ', letters: ['A', 'H', 'J', 'N', 'P', 'G', 'L'], text: 'Cách bạn suy nghĩ, phân tích và tổ chức thông tin. Mạnh ở đây nghĩa là bạn lý luận sắc sảo, học nhanh. Yếu ở đây nghĩa là bạn dễ bị cảm xúc dẫn dắt hoặc khó diễn đạt điều mình biết.' },
      { key: 'emotional', name: 'Bình diện Cảm xúc', letters: ['I', 'O', 'R', 'Z', 'B', 'S', 'T', 'X'], text: 'Cách bạn cảm nhận, kết nối và phản ứng với người khác. Mạnh ở đây nghĩa là bạn thấu cảm và tạo được gắn kết. Yếu ở đây nghĩa là bạn giữ khoảng cách, hoặc khó gọi tên cảm xúc của mình.' },
      { key: 'intuitive', name: 'Bình diện Trực giác', letters: ['K', 'F', 'Q', 'U', 'Y', 'C', 'V'], text: 'Cách bạn tiếp nhận những gì không được nói thành lời: linh cảm, ý nghĩa, tín hiệu tinh tế. Mạnh ở đây nghĩa là bạn biết trước khi hiểu. Yếu ở đây nghĩa là bạn cần bằng chứng mới tin, và điều đó đôi khi làm bạn chậm chạp.' }
    ]
  },

  hiddenPassion: {
    intro: 'Ẩn đam mê là con số xuất hiện nhiều nhất trong họ tên của bạn. Nó chỉ cho thấy điều bạn bị hút về, và thường là nơi bạn dễ tỏa sáng một cách tự nhiên.',
    1: 'Bạn có đam mê dẫn dắt, tự quyết và để lại dấu ấn riêng.',
    2: 'Bạn có đam mê gắn kết, chăm sóc và tạo sự hài hòa.',
    3: 'Bạn có đam mê sáng tạo, biểu đạt và niềm vui.',
    4: 'Bạn có đam mê trật tự, xây dựng và sự ổn định.',
    5: 'Bạn có đam mê trải nghiệm, tự do và điều mới lạ.',
    6: 'Bạn có đam mê gia đình, trách nhiệm và cái đẹp.',
    7: 'Bạn có đam mê tri thức, chiều sâu và sự thật.',
    8: 'Bạn có đam mê quyền lực, thành tựu và quản trị nguồn lực.',
    9: 'Bạn có đam mê cho đi, ý nghĩa và điều lớn hơn bản thân.'
  },

  personalMonth: {
    intro: 'Tháng cá nhân cho biết nhịp của từng tháng trong năm cá nhân. Lấy năm cá nhân cộng với số tháng dương lịch, rút gọn về 1–9.',
    1: 'Tháng khởi động: đặt việc mới, gửi lời đề nghị, bắt đầu.',
    2: 'Tháng chờ và kết nối: làm việc nhóm, lắng nghe, chăm sóc quan hệ.',
    3: 'Tháng nói và sáng tạo: giao tiếp, trình bày, gặp gỡ.',
    4: 'Tháng làm nền: hệ thống hóa, hoàn tất giấy tờ, chăm sức khỏe.',
    5: 'Tháng biến động: linh hoạt, đi lại, thử điều mới có kiểm soát.',
    6: 'Tháng gia đình: chăm sóc người thân, chỉnh trang nhà cửa.',
    7: 'Tháng tĩnh: học, đọc, nhìn lại, giảm giao tiếp không cần thiết.',
    8: 'Tháng kết quả: đòi nợ, đàm phán, quyết định tài chính.',
    9: 'Tháng buông: dọn dẹp, kết thúc, tha thứ, chuẩn bị chu kỳ mới.'
  },

  mastery: {
    intro: 'Bậc thầy (11/22/33) không phải "cao hơn" người khác. Đó là con số đòi hỏi nhiều hơn: cùng một bài học nhưng ở cường độ lớn hơn, và thường phải sống qua phiên bản rút gọn trước.',
    11: 'Bạn học qua số 2 trước: kết nối, nhạy cảm, kiên nhẫn. Khi đã vững, bạn mới dùng được trực giác và khả năng truyền cảm hứng ở quy mô lớn.',
    22: 'Bạn học qua số 4 trước: kỷ luật, xây nền, làm việc thật. Khi đã vững, bạn mới đủ sức biến tầm nhìn thành công trình.',
    33: 'Bạn học qua số 6 trước: yêu thương, trách nhiệm, chăm sóc. Khi đã vững, bạn mới chữa lành và dạy người khác mà không kiệt sức.'
  }
};
