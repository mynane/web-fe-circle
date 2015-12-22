package com.ruixus.smarty4j.statement.modifier;

import java.text.SimpleDateFormat;
import java.util.Date;

import com.ruixus.smarty4j.statement.Modifier;

public class $timestamp extends Modifier {

    public Object execute(Object obj) {
        String s = obj.toString();
        Date d = new Date();
        if (s.startsWith("today")) {
            s = (d.getYear() + 1900) + "-" + (d.getMonth() + 1) + "-" + (d.getDate()) + s.substring(5);
        } else if (s.startsWith("yesterday")) {
            d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
            s = (d.getYear() + 1900) + "-" + (d.getMonth() + 1) + "-" + (d.getDate()) + s.substring(9);
        }
        try {
            return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(s).getTime();
        } catch (Exception e) {
            return new Date().getTime();
        }
    }
}
