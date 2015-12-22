package org.lilystudio.ordinary.web.result;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.lilystudio.httpclient.GetMethod;
import org.lilystudio.httpclient.HttpClient;
import org.lilystudio.httpclient.IMethod;
import org.lilystudio.httpclient.PostMethod;
import org.lilystudio.ordinary.web.Controller;
import org.lilystudio.ordinary.web.IRelay;
import org.lilystudio.ordinary.web.UserInformation;
import org.w3c.dom.Node;

import com.ruixus.smarty4j.Context;
import com.ruixus.smarty4j.Engine;
import com.ruixus.smarty4j.Template;

/**
 * Smarty输出类, 将框架数据集传递至Smarty数据容器中处理, 并生成页面. <br>
 * <b>属性</b>
 * 
 * <pre>
 * type--指定输出的类型, 默认是text/html
 * path--模板文件的路径
 * </pre>
 * 
 * @version 0.1.4, 2008/12/12
 * @author 欧阳先伟
 * @since Ordinary 0.1
 */
public class WriteResult extends AbstractResult {

	/** Session的特殊保留字 */
	private static final String SESSION_COOKIE_KEY = "_JSESSIONID";

	/** 模板引擎对象 */
	private static Engine engine;

	/** 初始化模板引擎对象 */
	static {
		engine = new Engine();
		engine.setLeftDelimiter("{{");
		engine.setRightDelimiter("}}");
		engine.setTemplatePath(Controller.getContextPath() + "_ROOT/");
	}

	/**
	 * 获取模板引擎对象
	 * 
	 * @return 模板引擎对象
	 */
	public static Engine getEngine() {
		return engine;
	}

	private String text;

	private String proxy;

	private boolean remote;

	private boolean debug;

	/** 输出类型 */
	private String type = "text/html; charset=" + engine.getCharset();

	/**
	 * 设置输出类型
	 * 
	 * @param value
	 *          输出类型的值
	 */
	public void setType(String value) {
		type = value + "; charset=" + engine.getCharset();
	}

	public void init(Node node) throws Exception {
		text = node.getTextContent();
	}

	public void execute(HttpServletRequest request, HttpServletResponse response, IRelay relay)
	    throws Exception {
		String encoding = engine.getCharset().name();

		if (remote) {
			String url = (String) relay.get("QUERY_STRING");
			if (url == null || url.length() == 0) {
				url = this.proxy + relay.get("URI").toString();
			} else {
				url = this.proxy + relay.get("URI").toString() + "?" + url;
			}
			// 设置连接参数
			boolean isGet;
			if (relay.get("POST_DATA") != null) {
				isGet = false;
			} else {
				isGet = true;
			}
			IMethod httpMethod = isGet ? new GetMethod(url) : new PostMethod(url);
			// 设置客户端特殊的信息
			{
				String value = request.getHeader("If-None-Match");
				if (value != null) {
					httpMethod.setRequestHeader("If-None-Match", value);
				}
				value = request.getHeader("If-Modified-Since");
				if (value != null) {
					httpMethod.setRequestHeader("If-Modified-Since", value);
				}
				value = request.getHeader("Content-Type");
				if (value != null) {
					httpMethod.setRequestHeader("Content-Type", value);
				}
			}
			// 取出服务器端可能用到的Cookie信息
			Cookie[] cookies = request.getCookies();
			if (cookies != null) {
				StringBuilder s = new StringBuilder(64);
				for (Cookie cookie : cookies) {
					String name = cookie.getName();
					if (!name.equals("JSESSIONID")) {
						s.append(name).append('=').append(cookie.getValue()).append(';');
					}
				}
				UserInformation info = relay.getUserInformation(false);
				if (info != null) {
					Object o = info.getProperty(SESSION_COOKIE_KEY);
					if (o != null) {
						s.append(o);
					}
				}
				int len = s.length();
				if (len > 0) {
					s.setLength(len - 1);
				}
				httpMethod.setRequestHeader("Cookie", s.toString());
			}
			HttpClient httpClient = new HttpClient(debug);
			httpClient.setAutoDecode(true);
			try {
				if (!isGet) {
					PostMethod method = (PostMethod) httpMethod;
					method.addRequestBody((String) relay.get("POST_DATA"));
				}

				while (true) {
					// 计算是否需要跳转
					int statusCode = 0;
					statusCode = httpClient.execute(httpMethod);
					if (statusCode == HttpServletResponse.SC_MOVED_PERMANENTLY
					    || statusCode == HttpServletResponse.SC_MOVED_TEMPORARILY) {
						List<String> locationHeader = httpClient.getResponseHeader("Location");
						if (locationHeader != null) {
							httpMethod = new GetMethod(locationHeader.get(0));
							continue;
						}
					}
					response.setStatus(statusCode);
					break;
				}

				// 将得到的结果的头部输出
				Map<String, List<String>> headers = httpClient.getResponseHeaders();
				for (Map.Entry<String, List<String>> header : headers.entrySet()) {
					String name = header.getKey();
					List<String> values = header.getValue();
					if (name.equalsIgnoreCase("Set-Cookie")) {
						// 如果返回的cookie中有jsessionid, 为防止冲突,
						// 保存在用户的专属信息中
						for (String value : values) {
							int index = value.indexOf("JSESSIONID=");
							if (index >= 0) {
								int len = value.length();
								int endIndex = (value.indexOf(';', index + 10) + len) % len + 1;
								String sessionId = value.substring(index, endIndex);
								value = value.substring(0, index) + value.substring(endIndex);
								response.addHeader(name, value);
								// response.setHeader(name, value);
								UserInformation info = relay.getUserInformation(true);
								info.setProperty("_JSESSIONID", sessionId);
							} else {
								response.addHeader(name, value);
							}
						}
					} else {
						for (String value : values) {
							response.addHeader(name, value);
						}
					}
				}

				// 将得到的结果输出
				InputStream in = httpClient.getResponseBodyAsStream();
				if (in != null) {
					ByteArrayOutputStream out = new ByteArrayOutputStream();
					byte[] buf = new byte[1024];
					while (true) {
						int len = in.read(buf);
						if (len < 0) {
							break;
						}
						out.write(buf, 0, len);
					}
					OutputStream os = response.getOutputStream();
					if (debug) {
						System.out.println("---Response Body---");
						System.out.println(out.toString());
					}
					os.write(out.toByteArray());
					os.flush();
				}
			} finally {
				httpClient.close();
			}
		} else {
			Template template;
			if (text == null || text.length() == 0) {
				template = engine.getTemplate(relay.getRealPath(null));
			} else {
				template = new Template(engine, text);
			}
			Context context = new Context();
			context.putAll(relay.getDataMap());
			response.setContentType(type);
			response.setCharacterEncoding(encoding);
			template.merge(context, response.getWriter());
		}
	}
}